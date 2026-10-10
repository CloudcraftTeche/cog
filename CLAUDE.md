# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

COG ("Scripture School") is an LMS with four roles: `student`, `teacher`, `admin`, `superAdmin`. The repo holds two independent npm projects with no root `package.json` — run every command from inside `client/` or `server/`.

- `client/` — Next.js 15 (App Router, Turbopack), React 19, Tailwind v4, shadcn/Radix, TanStack Query v5, Axios, Socket.IO client
- `server/` — Express 5 + Socket.IO, Mongoose (MongoDB), JWT auth, Cloudinary uploads, Nodemailer

## Commands

| | `client/` | `server/` |
|---|---|---|
| Dev | `npm run dev` (port 3000) | `npm run dev` (nodemon + ts-node, port 5000) |
| Build | `npm run build` | `npm run build` (`tsc` → `dist/`) |
| Lint / type-check | `npm run lint` (`next lint`) | `npm run lint` (`tsc --noEmit`; there is no ESLint on the server) |
| Other | `npm run clean:project` (`eslint --fix` over `app/`) | `npm run migrate` (runs `src/migrations/addCascadingDeletes.migration.ts`) |

- **There are no tests and no test framework in either project.** Verify with lint/type-check plus manual checks against the dev servers (`GET /health`, `GET /api/v1/health`).
- `client/next.config.ts` sets `eslint.ignoreDuringBuilds: true`, so `npm run build` does not catch lint errors — run lint separately. The client has no standalone type-check script; use `npx tsc --noEmit` in `client/`.

## Environment

The env var names in `readme.md` and `docker-compose.yml` are stale. The names the code actually reads:

- **client** (`.env.local`): `NEXT_PUBLIC_SERVERURL` (must include the `/api/v1` suffix, e.g. `http://localhost:5000/api/v1`), `NEXT_PUBLIC_SOCKET_URL` (server origin, no path).
- **server** (`.env`): `PORT`, `MONGO_URI`, `NODE_ENV`, `WHITELISTORIGINS` (comma-separated CORS origins; ignored when `NODE_ENV=development`), `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_SECRET`, `FRONTEND_URL`, `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`, `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASSWORD`.

JWT secrets are split across files: HTTP auth signs/verifies with `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` (`server/src/utils/jwt.ts`), but the Socket.IO handshake verifies the same access token with `JWT_SECRET` (`server/src/lib/socket.ts`). **`JWT_SECRET` must equal `JWT_ACCESS_SECRET` or chat connections fail.** The `JWTACCESSTOKENSECRET`-style fields in `server/src/config/config.ts` are unused.

`docker-compose.yml` is not usable as-is: it builds from `./backend` and `./frontend` (the folders are `server` and `client`), and references Redis, RabbitMQ, nginx and a `worker` script that do not exist in the code.

## Server architecture

Request path: `server.ts` (cors → cookie-parser → helmet → compression → body parsers → rate limiter) → `/api/v1` → `routes/v1/index.ts` → `routes/v1/<domain>/index.ts` → `controllers/v1/<domain>/index.ts` → Mongoose models → `notFoundHandler` / `errorHandler`.

- **Routes and controllers map 1:1 by domain folder.** There is no service layer: controllers hold the business logic and are large (`chapter` ~1500 lines, `dashboard` ~1050). New domains must also be mounted in `routes/v1/index.ts`. Note mount paths differ from folder names (`superAdmin` → `/superAdmins`, `teacherChapter` → `/teacher-chapters`, `chat/chatRoom` → `/chatrooms`).
- **Middleware is applied per endpoint, not globally.** Each route declares its own chain, typically `authenticate` → `authorizeRoles(...)` → `upload` → express-validator arrays → `validate` → handler. Check the specific route rather than assuming a domain is protected.
- **Errors:** handlers are `async (req, res, next)` with try/catch, `throw new ApiError(status, message)` and `next(error)`. `errorHandler` maps `ApiError`, Mongoose validation/cast errors, duplicate keys (409) and JWT errors. Responses use `{ success, message, data }`; the auth middleware's 401s use `{ code: "AuthenticationError", message }` instead.
- **Auth (`middleware/authenticate.ts`):** access token from `Authorization: Bearer` or the `accessToken` cookie. If it is missing or expired, the `refreshToken` cookie is checked against the `Token` collection and rotated transparently (new cookies plus an `X-Access-Token` response header). Sets `req.userId`, `req.user`, `req.userRole`. Role checks exist in two forms: `authorizeRoles` (`middleware/authorizeRoles.ts`, re-queries the user) and `authorize` / `adminOnly` / `teacherOnly` / `studentOnly` exported from `authenticate.ts`.
- **Users are one collection.** `Student`, `Teacher`, `Admin`, `SuperAdmin` are Mongoose discriminators of `User` keyed on `role` (`models/user/`). `password` is `select: false`.
- **Academic model:** `Grade` embeds `Unit`s; `Chapter` belongs to a grade and unit and embeds its `contentItems`, quiz `questions` (exactly 4 options each, shared `Question.schema.ts`), and per-student `studentProgress` (`locked` → `accessible` → `in_progress` → `completed`, with submissions, quiz answers and activity progress). Student progress lives on the chapter document, not in a separate collection. `TeacherChapter` is a parallel content track for teachers. `Assignment` / `Submission` are separate collections.
- **Deletes cascade through model `pre("deleteOne")` hooks** plus helpers in `utils/cascadingDelete.ts`, which also remove Cloudinary assets. Use document-level `deleteOne()` so the hooks fire.
- **Uploads:** Multer uses memory storage (50 MB limit); controllers pass the buffer to `uploadToCloudinary` in `config/cloudinary.ts`, which picks the resource type from the file extension. Persist the returned `publicId` so cascades can clean up.
- **Realtime (`lib/socket.ts`):** Socket.IO shares the HTTP server. Sockets join `user-<id>` and, for students and teachers, their grade room. Controllers emit through `getIO()` exported from `server.ts`. Chat messages pass through the profanity filter (`middleware/profanity.ts`).
- The `@/*` path alias is configured in `server/tsconfig.json` but the code uses relative imports throughout — follow that.

## Client architecture

Data flow: page (`app/`) → hook (`hooks/<role>/`) → Axios instance (`lib/api.ts`) → TanStack Query cache → components (`components/<role>/`).

- **Organised by role, then by layer.** `app/dashboard/{admin,super-admin,teacher,student}/…` for routes, with matching `components/`, `hooks/`, `types/`, `utils/` and `lib/` subfolders. Pages are thin; API calls belong in hooks or `*.service.ts` files, not in page or component bodies.
- **`admin` and `super-admin` are duplicated route trees over the same `components/admin/*` and `hooks/admin/*`.** A change to an admin page almost always needs the matching super-admin page changed too. Sidebar entries for all roles live in `utils/navigations/navigation.ts`.
- **`lib/api.ts`** is the single Axios instance: attaches `Bearer` from `localStorage.accessToken`, and on a 401 calls `GET /auth/verify`, stores the new token, replays queued requests, or clears storage and redirects to `/login?returnUrl=…&sessionExpired=true`.
- **Two different `useAuth` hooks exist and are not interchangeable:** `hooks/useAuth.ts` (`useState` + `localStorage`, used by `app/page.tsx` and some feature components) and `hooks/auth/useAuth.ts` (TanStack Query via `useAuthQuery`, used by `app/dashboard/layout.tsx` and dashboard pages). Check which one a file already imports.
- **No `middleware.ts` route guard.** Auth and role gating are client-side, per layout or page. The server's per-route `authorizeRoles` is the real enforcement.
- **Query keys are defined per hook file** (`chapterKeys`, `gradeKeys`, …), with no central registry. Reuse the sibling file's key shape so invalidation keeps working. Defaults (`providers/query-provider.tsx`): `staleTime` 60s, no refetch on window focus, `retry: 1`.
- No global state library; local React state only. Toasts use Sonner. Chat uses `hooks/useSocket.ts`, which authenticates with the same `localStorage` access token.
- `utils/student/gradeOneActivities.ts` holds hard-coded grade 1 chapter activities (e.g. scrambled words); results are stored in the chapter's `activityProgress`.
- Misspelled paths are load-bearing — do not rename in passing: `components/admin/announcemnets`, `utils/teacherAttendace`, `hooks/admin/Useadmindashboard.ts`, `server/DockerFile`, `client/DockerFile`.

## Docs

`docs/` has longer references (`API.md`, `DATABASE.md`, `ROUTING.md`, `STATE_MANAGEMENT.md`, `SETUP.md`, …). Project convention: document new API routes in `docs/API.md` and new env vars in `docs/SETUP.md`. Copilot-oriented versions of these guidelines live in `.github/copilot-instructions.md` and `.github/instructions/{client,server}.instructions.md`; keep them in sync when conventions change.
