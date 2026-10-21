// Checks the PWA's auth safety against a production build, in a real Chrome with the service worker
// active: installability, the session-expired redirect, and that no API response, token or
// signed-in page ends up in Cache Storage. Every request to the API origin is answered by this
// script, so no real server is contacted. See "PWA (installable app)" in docs/SETUP.md to run it.
import puppeteer from "puppeteer-core";

const APP = process.env.APP_URL || "http://localhost:3456";
// Must match the NEXT_PUBLIC_SERVERURL origin the build was made with.
const API = process.env.FAKE_API_ORIGIN || "http://localhost:5999";
const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
};

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-first-run"] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

// Fake API: /auth/verify succeeds once (a signed-in student), then everything is 401.
let verifyCalls = 0;
const apiRequests = [];
await page.setRequestInterception(true);
page.on("request", (req) => {
  const url = req.url();
  if (!url.startsWith(API)) return req.continue();
  if (req.method() === "OPTIONS") {
    return req.respond({ status: 204, headers: corsHeaders(req) });
  }
  apiRequests.push(url.replace(API, ""));
  if (url.includes("/auth/verify") && verifyCalls++ === 0) {
    return req.respond({
      status: 200,
      contentType: "application/json",
      headers: corsHeaders(req),
      body: JSON.stringify({
        success: true,
        data: {
          accessToken: "SECRET-ACCESS-TOKEN",
          user: { _id: "u1", id: "u1", name: "Test Student", email: "s@example.com", role: "student" },
        },
      }),
    });
  }
  return req.respond({
    status: 401,
    contentType: "application/json",
    headers: corsHeaders(req),
    body: JSON.stringify({ code: "AuthenticationError", message: "Token expired" }),
  });
});
function corsHeaders(req) {
  return {
    "access-control-allow-origin": APP,
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": req.headers()["access-control-request-headers"] || "*",
    "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  };
}

// 1. Service worker installs and controls the page.
await page.goto(`${APP}/login`, { waitUntil: "networkidle0" });
await page.evaluate(() => navigator.serviceWorker.ready);
await page.reload({ waitUntil: "networkidle0" });
const controlled = await page.evaluate(() => !!navigator.serviceWorker.controller);
check("Service worker active and controlling the page", controlled);

// 2. Installability, as Chrome itself judges it.
const cdp = await page.createCDPSession();
const { installabilityErrors } = await cdp.send("Page.getInstallabilityErrors");
check("Chrome reports no installability errors", installabilityErrors.length === 0, JSON.stringify(installabilityErrors));
const manifest = await cdp.send("Page.getAppManifest");
check("Manifest parses without errors", manifest.errors.length === 0 && !!manifest.data, `${manifest.errors.length} errors`);

// 3. Session expiry with the SW active: signed-in student, then the API starts returning 401.
await page.evaluate(() => {
  localStorage.setItem("accessToken", "OLD-TOKEN");
  localStorage.setItem("user", JSON.stringify({ _id: "u1", name: "Test Student", role: "student" }));
});
await page.goto(`${APP}/dashboard`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => location.pathname === "/login" && location.search.includes("sessionExpired=true"), {
  timeout: 20000,
}).catch(() => {});
const finalUrl = new URL(page.url());
check(
  "Session expiry redirects to /login?…sessionExpired=true",
  finalUrl.pathname === "/login" && finalUrl.searchParams.get("sessionExpired") === "true",
  page.url().replace(APP, ""),
);
const tokenCleared = await page.evaluate(() => localStorage.getItem("accessToken") === null);
check("Access token removed from localStorage after expiry", tokenCleared);
check("Auth endpoints were called through the network", apiRequests.some((u) => u.includes("/auth/verify")), apiRequests.slice(0, 4).join(", "));

// 4. Nothing from the API (auth or otherwise) is in Cache Storage, and no token is stored anywhere in it.
const cacheReport = await page.evaluate(async (api) => {
  const report = { caches: {}, apiEntries: [], tokenHits: [] };
  for (const name of await caches.keys()) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    report.caches[name] = keys.length;
    for (const req of keys) {
      if (req.url.startsWith(api) || req.url.includes("/auth")) report.apiEntries.push(req.url);
      const res = await cache.match(req);
      const type = res.headers.get("content-type") || "";
      if (/json|text|javascript|html/.test(type)) {
        const body = await res.text();
        if (body.includes("SECRET-ACCESS-TOKEN") || body.includes("OLD-TOKEN")) report.tokenHits.push(req.url);
      }
    }
  }
  return report;
}, API);
check("No API or /auth responses in Cache Storage", cacheReport.apiEntries.length === 0, JSON.stringify(cacheReport.caches));
check("No access token found in any cached response", cacheReport.tokenHits.length === 0, cacheReport.tokenHits.join(", "));

// 5. Pages are network-only: the dashboard HTML must not be in any cache.
const cachedPages = await page.evaluate(async (app) => {
  const hits = [];
  for (const name of await caches.keys()) {
    for (const req of await (await caches.open(name)).keys()) {
      const path = req.url.replace(app, "");
      if (path === "/dashboard" || path.startsWith("/dashboard/") || path === "/login") hits.push(path);
    }
  }
  return hits;
}, APP);
check("Signed-in pages (/dashboard, /login) are not cached", cachedPages.length === 0, cachedPages.join(", "));

await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
