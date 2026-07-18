# Deployment

## Docker Images

Both apps ship a Dockerfile:

- **Backend**: [server/DokerFile](../server/DokerFile) — `node:18-alpine`, `npm ci --only=production`, `npm run build` (tsc), creates `uploads`/`logs` dirs, exposes port `5000`, healthcheck against `http://localhost:5000/health`, starts with `npm start`.
- **Frontend**: [client/DockerFile](../client/DockerFile) — multi-stage build (`deps` → `builder` → `runner`), uses Next.js standalone output (`.next/standalone`, `.next/static`), runs as a non-root `nextjs` user, exposes port `3000`, starts with `node server.js`.

> Note: both Dockerfiles are named `DokerFile`/`DockerFile` (not the conventional `Dockerfile`), so `docker build` requires `-f server/DokerFile` / `-f client/DockerFile` unless renamed.

## docker-compose

[docker-compose.yml](../docker-compose.yml) at the repo root defines: `mongodb`, `redis`, `rabbitmq`, `backend`, `frontend`, `nginx`, and a `queue_worker` service, all on an `edu_network` bridge network.

**Known mismatch**: the `backend` and `queue_worker` services use `build: ./backend`, and `frontend` uses `build: ./frontend`. This repository's actual folders are `server/` and `client/` — there is no `backend/` or `frontend/` directory. **`docker-compose up` will fail as-is** until either the compose file's `build:` paths are updated to `./server` and `./client`, or those folders are renamed to match. This must be fixed before using `docker-compose.yml` in this repo.

Other items to verify before deploying with this compose file:
- The `backend` service's `MONGODB_URI` uses a live MongoDB Atlas connection string with embedded credentials — treat this as a placeholder to replace with a secret-managed value, not a value to reuse.
- `queue_worker` runs `npm run worker`, but no `worker` script exists in [server/package.json](../server/package.json) — this service will fail to start until such a script is added.
- `nginx` expects `./nginx.conf` and `./ssl` at the repo root — neither was found in this repository during inspection; add them before enabling the `nginx` service.
- The `frontend` service sets `NEXT_PUBLIC_API_URL`, but the actual client code reads `NEXT_PUBLIC_SERVERURL` (see [SETUP.md](./SETUP.md) and [client/lib/api.ts](../client/lib/api.ts)) — align the compose environment keys with what the client actually consumes.

## Manual Deployment (without compose)

1. **Backend**: build the TypeScript output and run it against a reachable MongoDB instance.
   ```bash
   cd server
   npm ci
   npm run build
   npm start
   ```
   Ensure all variables from [SETUP.md](./SETUP.md) are set in the deployment environment, and `NODE_ENV=production` so cookies are issued with `secure: true` / `sameSite: "none"` (see [server/src/middleware/authenticate.ts](../server/src/middleware/authenticate.ts)).

2. **Frontend**: build and start the Next.js standalone server.
   ```bash
   cd client
   npm ci
   npm run build
   npm start
   ```
   Set `NEXT_PUBLIC_SERVERURL` (including `/api/v1`) and `NEXT_PUBLIC_SOCKET_URL` to the deployed backend's public origin at build time, since `NEXT_PUBLIC_*` values are inlined at build time by Next.js.

3. **CORS**: the backend only allows origins in `WHITELISTORIGINS` (comma-separated) when `NODE_ENV !== "development"` (see `config.ts` and the `corsOptions` callback in [server/src/server.ts](../server/src/server.ts)) — the deployed frontend origin must be included here or all cross-origin requests will be rejected.

## Health Checks

- Backend: `GET /health` (plain Express) and `GET /api/v1/health` (API-level, also enumerates mounted route prefixes).
- The backend Dockerfile's `HEALTHCHECK` targets `http://localhost:5000/health`.
