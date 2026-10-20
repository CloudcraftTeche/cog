// Generates the PWA icons and iOS splash screens in public/icons and public/splash from public/logo.png.
// Run from client/: `node scripts/generate-pwa-assets.mjs`. Uses sharp, which ships with Next.js.
// The splash sizes live in lib/pwa/splash-screens.json, which the root layout also reads.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import splashScreens from "../lib/pwa/splash-screens.json" with { type: "json" };

const LOGO = "public/logo.png";
// The orange "G" with the open book, cut out of the LOGOS wordmark.
const MARK = { left: 1195, top: 0, width: 693, height: 693 };
const WHITE = "#ffffff";

const mark = (size) => sharp(LOGO).extract(MARK).resize(size, size).png().toBuffer();

async function icon(file, canvas, markSize) {
  await sharp({ create: { width: canvas, height: canvas, channels: 4, background: WHITE } })
    .composite([{ input: await mark(markSize), gravity: "center" }])
    .png({ palette: true })
    .toFile(file);
}

async function splash({ width, height }) {
  const logoWidth = Math.round(width * 0.6);
  const logo = await sharp(LOGO).resize({ width: logoWidth }).png().toBuffer();
  await sharp({ create: { width, height, channels: 4, background: WHITE } })
    .composite([{ input: logo, gravity: "center" }])
    .png({ palette: true })
    .toFile(`public/splash/splash-${width}x${height}.png`);
}

await mkdir("public/icons", { recursive: true });
await mkdir("public/splash", { recursive: true });

await icon("public/icons/icon-192.png", 192, 148);
await icon("public/icons/icon-512.png", 512, 396);
// Maskable icons are cropped to a circle by Android, so keep the mark inside the 80% safe zone.
await icon("public/icons/icon-maskable-512.png", 512, 300);
await icon("public/icons/apple-touch-icon.png", 180, 136);

for (const screen of splashScreens) await splash(screen);

console.log(`Generated 4 icons and ${splashScreens.length} splash screens.`);
