# COG (Scripture School LMS) — Project Guidelines

This is a two-project monorepo:

- **`client/`** — Next.js 15 (App Router), React 19, TypeScript frontend. See [.github/instructions/client.instructions.md](./instructions/client.instructions.md) for frontend-specific conventions.
- **`server/`** — Express 5 + Socket.IO REST API, TypeScript, MongoDB via Mongoose. See [.github/instructions/server.instructions.md](./instructions/server.instructions.md) for backend-specific conventions.

## Architecture

Browser → Next.js client (Axios, bearer token + cookies) → Express API at `/api/v1` → MongoDB (Mongoose). Realtime chat uses Socket.IO between client and server directly. Media uploads go through Cloudinary; email via Nodemailer/SMTP.

## Conventions That Apply to Both Projects

- No automated test framework (Jest/Vitest/Mocha) is configured in either project — there is no `npm test`. Verify changes manually via the dev servers, and rely on `npm run lint` / `tsc --noEmit` for type safety.
- Both `client/tsconfig.json` and `server/tsconfig.json` use `strict: true`.
- Before opening a PR: run lint and build for whichever project(s) changed, and manually verify the affected flow against a running dev server.
- If you add a new environment variable, document it in `docs/SETUP.md`. If you add a new API route, document it in `docs/API.md`.
- `docker-compose.yml` references `./backend` and `./frontend` build contexts, which do not match the actual `server`/`client` folder names — be aware of this mismatch when touching Docker/deployment config.

## Detailed Docs

Existing reference docs live under `docs/` (ARCHITECTURE.md, API.md, ROUTING.md, STATE_MANAGEMENT.md, COMPONENTS.md, SETUP.md, CONTRIBUTING.md, DEPLOYMENT.md, TROUBLESHOOTING.md) — consult these for details beyond what's summarized here rather than assuming.
