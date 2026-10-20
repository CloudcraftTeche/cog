# Setup

## Prerequisites

- Node.js (repo Dockerfiles use `node:18-alpine`)
- A MongoDB instance (local or Atlas) — `server` connects via `MONGO_URI` ([server/src/config/config.ts](../server/src/config/config.ts), default fallback `mongodb://localhost:27017/cogDb`)
- A Cloudinary account (used by `server/src/middleware/upload.ts` for media uploads)
- SMTP credentials for Nodemailer (used by `server/src/lib/mail/`)

## 1. Backend (`server/`)

```bash
cd server
npm install
```

Create `server/.env` with at least the variables consumed in [server/src/config/config.ts](../server/src/config/config.ts):

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWTACCESSTOKENSECRET=your_access_token_secret
JWTREFRESHTOKENSECRET=your_refresh_token_secret
JWTACCESSTOKENEXPIRESIN=15m
JWTREFRESHTOKENEXPIRESIN=30d
WHITELISTORIGINS=http://localhost:3000
NODE_ENV=development
```

Additional variables referenced elsewhere in the codebase (Cloudinary uploads, mail) should also be set per `server/src/middleware/upload.ts` and `server/src/lib/mail/` — check those files for the exact variable names your Cloudinary/SMTP integration expects before relying on names from the root [readme.md](../readme.md), which lists indicative names (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`, `CLIENT_URL`) that were not independently re-verified against every consuming file for this document.

Run the dev server (uses [server/nodemon.json](../server/nodemon.json), which runs `ts-node -r tsconfig-paths/register src/server.ts` and watches `src`):

```bash
npm run dev
```

Other scripts (from [server/package.json](../server/package.json)):

```bash
npm run build     # tsc -> dist/
npm run start     # node -r tsconfig-paths/register dist/server.js
npm run lint      # tsc --noEmit
npm run migrate   # ts-node src/migrations/addCascadingDeletes.migration.ts
```

## 2. Frontend (`client/`)

```bash
cd client
npm install
```

An existing [client/.env.local](../client/.env.local) already defines (adjust the port to match your running backend):

```env
NEXT_PUBLIC_SERVERURL=http://localhost:5001/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

`NEXT_PUBLIC_SERVERURL` must include the `/api/v1` prefix — it is used directly as the Axios `baseURL` in [client/lib/api.ts](../client/lib/api.ts). `NEXT_PUBLIC_SOCKET_URL` is the bare origin used by [client/hooks/useSocket.ts](../client/hooks/useSocket.ts) for the Socket.IO connection (no `/api/v1`).

Run the dev server (Turbopack, per [client/package.json](../client/package.json)):

```bash
npm run dev
```

Other scripts:

```bash
npm run build             # next build
npm run start             # next start
npm run lint               # next lint
npm run clean:project      # eslint --fix on app/**
```

### PWA (installable app)

The client is a Progressive Web App built with [Serwist](https://serwist.pages.dev/docs/next) (`@serwist/next`). No env vars are needed.

- **The service worker only exists in production builds.** `npm run dev` (Turbopack) has none, so test PWA behaviour with `npm run build && npm run start`. The build writes `public/sw.js`, which is gitignored.
- **Service worker:** [client/app/sw.ts](../client/app/sw.ts). It precaches the build's static assets, the offline page, the logo and the icons. Pages always come from the network, with [client/app/~offline/page.tsx](../client/app/~offline/page.tsx) as the fallback when offline. API calls are never cached. The precache list for `public/` files is in [client/next.config.ts](../client/next.config.ts).
- **Manifest:** [client/app/manifest.ts](../client/app/manifest.ts), served at `/manifest.webmanifest`. iOS meta tags and splash screens are set in [client/app/layout.tsx](../client/app/layout.tsx).
- **Icons and splash screens** are generated from `public/logo.png` with `node scripts/generate-pwa-assets.mjs`. Splash sizes are listed in [client/lib/pwa/splash-screens.json](../client/lib/pwa/splash-screens.json). Re-run the script after changing the logo or the list, and commit the output.
- **Updates:** [client/components/shared/pwa/PwaProvider.tsx](../client/components/shared/pwa/PwaProvider.tsx) registers the worker and checks for a new deployment hourly. When one is waiting, it shows an "A new version of Logos is available" toast, and **Update** activates it and reloads.
- **Install prompt:** [client/components/shared/pwa/InstallPrompt.tsx](../client/components/shared/pwa/InstallPrompt.tsx) is shown to students on the dashboard. It uses the browser's install dialog where supported, or "Add to Home Screen" instructions on iOS. "Not now" hides it for 14 days.

Testing:

1. `npm run build && npm run start`, then open `http://localhost:3000` in Chrome. Service workers need `localhost` or HTTPS, so use a tunnel or the deployed site to test on a phone.
2. DevTools → **Application**: **Manifest** should show no installability errors, and **Service workers** should show `sw.js` as activated.
3. **Offline page:** in **Network**, set throttling to *Offline* and reload. The branded offline page appears, and it reloads by itself when you go back online.
4. **Update prompt:** with the app open, rebuild and restart the server, then click **Update** next to `sw.js` in **Application → Service workers** (or wait for the hourly check). The update toast appears.
5. To reset, use **Application → Storage → Clear site data**.

## Verifying the Setup

1. Start MongoDB, then `npm run dev` in `server` — confirm `🚀 Server running on port <PORT>` in the console.
2. `GET http://localhost:<PORT>/health` should return `{ "status": "ok", ... }`.
3. Start `npm run dev` in `client`, open the app root — [client/app/page.tsx](../client/app/page.tsx) should redirect to `/login` when unauthenticated.
