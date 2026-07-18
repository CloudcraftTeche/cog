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

## Verifying the Setup

1. Start MongoDB, then `npm run dev` in `server` — confirm `🚀 Server running on port <PORT>` in the console.
2. `GET http://localhost:<PORT>/health` should return `{ "status": "ok", ... }`.
3. Start `npm run dev` in `client`, open the app root — [client/app/page.tsx](../client/app/page.tsx) should redirect to `/login` when unauthenticated.
