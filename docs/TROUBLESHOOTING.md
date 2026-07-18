# Troubleshooting

## `docker-compose up` fails to build `backend`/`frontend`

**Cause**: [docker-compose.yml](../docker-compose.yml) uses `build: ./backend` and `build: ./frontend`, but this repository's folders are named `server/` and `client/`. See [DEPLOYMENT.md](./DEPLOYMENT.md).

**Fix**: update the `build:` paths in `docker-compose.yml` to `./server` and `./client` (and update related `volumes:` paths like `./backend/uploads`, `./backend/logs`), or rename the folders — pick one and keep compose in sync.

## 401 errors in a loop, or user logged out unexpectedly

**Cause**: the client's Axios response interceptor ([client/lib/api.ts](../client/lib/api.ts)) retries once on `401` by calling the refresh endpoint, and the backend's `authenticate` middleware ([server/src/middleware/authenticate.ts](../server/src/middleware/authenticate.ts)) rotates both access and refresh tokens on every refresh. If the stored refresh token in the `Token` collection is out of sync with the cookie (e.g. concurrent tabs, or a failed rotation), subsequent refreshes will fail with `401 AuthenticationError` and clear auth cookies.

**Check**:
- Confirm `WHITELISTORIGINS` includes your frontend origin in non-development environments — CORS `credentials: true` requires an exact origin match, not `*`.
- Confirm the client and server clocks are reasonably in sync (JWT expiry checks depend on this).
- Two separate `useAuth` hooks exist client-side ([client/hooks/useAuth.ts](../client/hooks/useAuth.ts) vs [client/hooks/auth/useAuth.ts](../client/hooks/auth/useAuth.ts)) with different state sources (`localStorage`-driven `useState` vs TanStack Query) — verify which one a given page/component uses before debugging apparent state desync.

## CORS errors in the browser console

**Cause**: `server/src/server.ts` only allows origins that are `undefined` (non-browser requests), or present in `config.whitelistOrigins`, unless `NODE_ENV === "development"` (which allows everything).

**Fix**: set `WHITELISTORIGINS` (comma-separated, no trailing slash) in the server environment to include the exact frontend origin being used.

## Socket.IO chat not connecting

**Cause**: [client/hooks/useSocket.ts](../client/hooks/useSocket.ts) reads `NEXT_PUBLIC_SOCKET_URL`, which must be the **bare origin** (no `/api/v1` suffix), unlike `NEXT_PUBLIC_SERVERURL` used by the Axios client which **does** include `/api/v1`. Mixing these up is a common misconfiguration — see [SETUP.md](./SETUP.md).

**Check**: server-side, confirm the Socket.IO CORS origin list in `server/src/server.ts` (`["http://localhost:3000"]` in development, else `config.whitelistOrigins`) includes your frontend origin.

## Image upload / Cloudinary errors

**Cause**: uploads are handled by Multer + Cloudinary storage in [server/src/middleware/upload.ts](../server/src/middleware/upload.ts). Missing or invalid `CLOUDINARY_*` environment variables will surface as upload failures on announcement/chapter/profile image endpoints.

**Check**: verify the exact variable names expected in `server/src/middleware/upload.ts` — do not assume the names shown in the root [readme.md](../readme.md) are exhaustive or verbatim without checking that file directly.

## `next build` succeeds despite lint errors

**Cause**: [client/next.config.ts](../client/next.config.ts) sets `eslint.ignoreDuringBuilds: true`, so ESLint problems will not fail `npm run build`.

**Fix**: run `npm run lint` explicitly as part of your workflow/CI — do not rely on `next build` to catch lint issues.

## `queue_worker` service exits immediately (Docker)

**Cause**: `docker-compose.yml`'s `queue_worker` service runs `npm run worker`, but [server/package.json](../server/package.json) has no `worker` script defined.

**Fix**: either remove the `queue_worker` service from `docker-compose.yml` if it is not needed, or add a corresponding `worker` script to `server/package.json` before enabling it.

## Type errors after pulling changes

Run the type-check scripts directly rather than assuming the dev server surfaces every failure:

```bash
cd server && npm run lint   # tsc --noEmit
cd client && npx tsc --noEmit
```

(There is no dedicated `tsc --noEmit` script in `client/package.json`; `npm run lint` there runs `next lint`, not the TypeScript compiler.)
