---
description: "Backend conventions for the server/ Express + MongoDB API — routing, auth, models, and code organization. Applies when editing files under server/."
applyTo: "server/**"
---

# Server (Express Backend) Instructions

## Stack

Express 5 + Socket.IO, TypeScript (`strict: true`), MongoDB via Mongoose, JWT auth (`jsonwebtoken`), `express-validator`, Multer + Cloudinary (media uploads), Nodemailer (SMTP), `helmet`, `compression`, `express-rate-limit`, `bad-words-next` (profanity filter).

## Bootstrap ([server/src/server.ts](../../server/src/server.ts))

- Middleware order: `cors` → `cookie-parser` → `helmet` → `compression` → `express.json`/`urlencoded` (200mb limit) → custom rate limiter ([server/src/lib/express_rate_limit.ts](../../server/src/lib/express_rate_limit.ts)).
- All API routes mounted under `/api/v1` via `v1Routes` ([server/src/routes/v1/index.ts](../../server/src/routes/v1/index.ts)).
- Health checks: `GET /health` (plain) and `GET /api/v1/health` (lists all mounted route prefixes).
- `notFoundHandler` and `errorHandler` ([server/src/middleware/errorHandler.ts](../../server/src/middleware/errorHandler.ts)) run last — always after all routes.
- Socket.IO server shares the same HTTP server, initialized via `initializeSocketIO` ([server/src/lib/socket.ts](../../server/src/lib/socket.ts)).
- Graceful shutdown handles `SIGTERM`/`SIGINT`/`uncaughtException`: closes Socket.IO, closes HTTP server, then disconnects MongoDB ([server/src/lib/mongoose.ts](../../server/src/lib/mongoose.ts)).

## Folder Responsibilities

| Folder | Responsibility |
|---|---|
| `config/` | Environment-driven config (`config.ts`) — port, DB URL, JWT secrets/expiry, CORS whitelist. |
| `routes/v1/` | Express routers, one subfolder per domain (auth, admin, superAdmin, teachers, students, grade, chapter, teacherChapter, assignment, submission, announcement, attendance, teacherAttendance, chat, queries, todo, dashboard). Mounted centrally in `routes/v1/index.ts`. |
| `controllers/v1/` | Request handlers referenced by routers, mirroring the same domain folders. |
| `models/` | Mongoose schemas grouped by domain: `academic/` (Chapter, Grade, TeacherChapter, Unit), `user/` (Admin, Student, Teacher, User), `auth/` (Token, PasswordResetToken), plus `announcement.ts`, `assignment/`, `attendance/`, `chat/`, `query/`, `shared/`. |
| `middleware/` | `authenticate.ts` (JWT access/refresh), `authorizeRoles.ts` (RBAC), `errorHandler.ts`, `profanity.ts`, `upload.ts` (Multer/Cloudinary), `validate.ts` (express-validator wrapper). |
| `lib/` | Cross-cutting infra: `mongoose.ts`, `socket.ts`, `express_rate_limit.ts`, `chat.service.ts`, `mail/`. |
| `migrations/` | One-off data migration scripts, run via `npm run migrate`. |
| `utils/` | Shared helpers (e.g. JWT signing/verification used by `authenticate.ts`). |

**Keep the `routes/v1/<domain>` ↔ `controllers/v1/<domain>` 1:1 mapping when adding a new domain.**

## Authentication & Authorization

Implemented in [server/src/middleware/authenticate.ts](../../server/src/middleware/authenticate.ts) and [server/src/middleware/authorizeRoles.ts](../../server/src/middleware/authorizeRoles.ts):

1. `authenticate` reads the access token from `Authorization: Bearer <token>`, falling back to the `accessToken` cookie.
2. Valid access token → decodes `userId`, attaches to `req.userId`.
3. Missing/expired access token → looks up the stored refresh token (`Token` model) via the `refreshToken` cookie, verifies it, and rotates (issues + stores new access/refresh tokens) if valid.
4. No valid token chain → clears auth cookies, responds `401 AuthenticationError`.
5. `authorizeRoles(...roles)` runs **after** `authenticate`, loads the `User` by `req.userId`, rejects `403` if `role` isn't in the allowed list.

Cookie behavior: `httpOnly` always; `secure`/`sameSite: "none"` only in production, else `sameSite: "lax"`. Access token cookie: 15 min. Refresh token: 30 days (`TOKEN_CONFIG` in `authenticate.ts`).

**Route-level middleware is applied per-endpoint, not globally** — protection varies by route within the same domain file. Always check the specific `routes/v1/<domain>/index.ts` file rather than assuming a blanket auth policy applies.

## Adding a New Route

1. Add the handler in `controllers/v1/<domain>/`.
2. Wire it in `routes/v1/<domain>/index.ts`, applying `authenticate`/`authorizeRoles`/validators as needed for that specific endpoint (check sibling routes in the same file for the expected pattern).
3. If it's a new domain, mount the router in [server/src/routes/v1/index.ts](../../server/src/routes/v1/index.ts).
4. Document the new route (method/path/middleware) in `docs/API.md`.

## Linting & Build

- `npm run lint` runs `tsc --noEmit` (this is the server's type-check, not ESLint).
- `npm run build` runs `tsc` → `dist/`.
- `npm run dev` uses nodemon + `ts-node -r tsconfig-paths/register src/server.ts`, watching `src`.
- No test framework configured — verify changes manually via `npm run dev` and the `/health` endpoint.
