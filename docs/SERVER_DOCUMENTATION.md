# Server Documentation

Scope: This documentation is derived from the current codebase in `server/` (Express 5 + Socket.IO + MongoDB/Mongoose backend). It complements [ARCHITECTURE.md](./ARCHITECTURE.md) and [API.md](./API.md) with granular, per-file detail (controllers, models, middleware, lib, utils) that those docs summarize at a higher level. If a detail could not be verified from code, it is marked as "Not found in the current project."

## 1. Project Overview

- Purpose: REST API + realtime backend for the Scripture School LMS, serving the `client/` Next.js frontend.
- Tech stack: Express 5, TypeScript (`strict: true`), MongoDB via Mongoose 8, Socket.IO 4, JWT auth (`jsonwebtoken`), `express-validator`, Multer + Cloudinary (media), Nodemailer (SMTP), `helmet`, `compression`, `express-rate-limit`, `bad-words-next` (profanity filter), `bcrypt` (password hashing).
- Entry point: [server/src/server.ts](../server/src/server.ts) — builds the Express app, wraps it in a raw `http.Server` shared with Socket.IO, connects to MongoDB, then listens on `config.PORT`.

## 2. Folder Structure

| Folder | Responsibility |
|---|---|
| `config/` | `config.ts` (env-driven app config), `cloudinary.ts` (Cloudinary SDK setup + upload/delete helpers). |
| `routes/v1/` | Express routers, one subfolder per domain, mounted centrally in `routes/v1/index.ts`. |
| `controllers/v1/` | Request handlers, mirroring the same domain folders as `routes/v1/`. |
| `models/` | Mongoose schemas grouped by domain (see §5). |
| `middleware/` | `authenticate.ts`, `authorizeRoles.ts`, `errorHandler.ts`, `profanity.ts`, `upload.ts`, `validate.ts`. |
| `lib/` | `mongoose.ts`, `socket.ts`, `express_rate_limit.ts`, `chat.service.ts`, `mail/`. |
| `migrations/` | One-off scripts, e.g. `addCascadingDeletes.migration.ts`. |
| `utils/` | `ApiError.ts`, `cascadingDelete.ts`, `jwt.ts`, `email/transporter.ts`. |
| `@types/` | Ambient type declarations (`express/index.d.ts` — likely augments `Request`). |

## 3. Application Bootstrap ([server/src/server.ts](../server/src/server.ts))

1. `createApp()` builds the Express app:
   - CORS: allows all origins in `development`, otherwise only origins in `config.whitelistOrigins` (or no-origin requests, e.g. curl/mobile). `credentials: true`.
   - Middleware order: `cors` → `cookie-parser` → `helmet` (`crossOriginEmbedderPolicy: false`, cross-origin resource policy) → `compression` (level 6, threshold 2048 bytes) → `express.json`/`urlencoded` (200mb limit) → `expressRateLimit` (global rate limiter).
   - `GET /health` returns `{ status: "ok", timestamp }` directly (before the `/api/v1` mount).
   - All domain routers mounted under `/api/v1` via `v1Routes`.
   - `notFoundHandler` then `errorHandler` registered last.
2. `bootstrap()` connects to MongoDB first (`connectToDatabase()`), then creates the HTTP server, attaches a Socket.IO server (CORS origin: `["http://localhost:3000"]` in dev, else `config.whitelistOrigins`; `transports: ["websocket", "polling"]`; `pingTimeout: 60000`), calls `initializeSocketIO(io)`, then `server.listen(config.PORT)`.
3. Graceful shutdown (`SIGTERM`/`SIGINT`/`uncaughtException`): closes Socket.IO → closes HTTP server → `disconnectFromDatabase()` → `process.exit(0)`, with a 30s force-exit timeout as a safety net.
4. `getIO()` exposes the initialized Socket.IO instance to other modules (throws if called before `bootstrap()` completes).

## 4. Configuration ([server/src/config/config.ts](../server/src/config/config.ts))

| Env var | Used for | Default if unset |
|---|---|---|
| `PORT` | HTTP port | `5000` |
| `MONGO_URI` | Mongoose connection string | `mongodb://localhost:27017/cogDb` |
| `NODE_ENV` | Dev vs prod behavior (CORS, cookies, error verbosity) | `development` |
| `JWT_SECRET` | Used directly by `lib/socket.ts` for Socket.IO handshake token verification | hardcoded fallback string (should be overridden in every real environment) |
| `WHITELISTORIGINS` | Comma-separated allowed CORS origins (non-dev) | `["http://localhost:3000"]` |
| `JWTACCESSTOKENSECRET` / `JWTREFRESHTOKENSECRET` / `JWTACCESSTOKENEXPIRESIN` / `JWTREFRESHTOKENEXPIRESIN` | Declared on the `Config` type but **not actually read anywhere else in the codebase** — see Known Issues below. | — |

[server/src/config/cloudinary.ts](../server/src/config/cloudinary.ts) configures the Cloudinary SDK from `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`, and exports `uploadToCloudinary` (buffer → stream upload, auto-picks `image`/`video`/`raw` resource type from file extension) and `deleteFromCloudinary`.

## 5. Database Models ([server/src/models/](../server/src/models))

| Model | File | Key fields | Notes |
|---|---|---|---|
| `User` (base) | `user/User.model.ts` | `name`, `email` (unique), `password` (hashed, `select: false`), `phone`, `gender`, `dateOfBirth`, `profilePictureUrl`/`profilePicturePublicId`, `address`, `role` (`student`\|`teacher`\|`admin`\|`superAdmin`) | Base schema for a Mongoose **discriminator** pattern; has `comparePassword()`. |
| `Admin`, `SuperAdmin` | `user/Admin.model.ts` | `Admin.permissions[]`; `SuperAdmin.lastLogin` | Both are `User.discriminator(...)`. `Admin` cascade-deletes: unsets `createdBy` on teachers it created. |
| `Student` | `user/Student.model.ts` | `rollNumber`, `parentContact`, `gradeId` (ref `Grade`) | Unique compound index `(rollNumber, gradeId)` (partial, only when both present) + unique `email`. `deleteOne` cascade: deletes Cloudinary files, `Submission`s, `Attendance`, pulls `studentProgress` entries from `Chapter`. |
| `Teacher` | `user/Teacher.model.ts` | `qualifications`, `specializations[]`, `gradeId` (ref `Grade`, required), `createdBy` (ref `Admin`, required) | `deleteOne` cascade: deletes owned `Assignment`/`Submission`/`Attendance`/`TeacherAttendance`/`Chapter`/`TeacherChapter` data and associated Cloudinary files. |
| `Grade` | `academic/Grade.model.ts` | `grade` (unique), `description`, `units: IUnit[]`, `isActive`, `academicYear` | Instance methods: `addUnit`, `updateUnit`, `deleteUnit`, `getChapters`, `addSubmission`, `addAttendance`, `getAttendancePercentage`, `getAssignmentCompletionRate`, `getAverageScore`. `deleteOne` cascades into assignments/submissions/attendance/chapters. |
| `Unit` (schema, not a standalone model) | `academic/Unit.schema.ts` | `name`, `description`, `orderIndex` | Embedded in `Grade.units`. |
| `Chapter` | `academic/Chapter.model.ts` | `title`, `gradeId`, `unitId`, `chapterNumber`, `contentItems[]` (video/text/pdf/mixed), `questions[]` (quiz), `studentProgress[]` (per-student status/score/submissions/quizAnswers) | Student-facing chapter content + embedded per-student progress tracking. |
| `TeacherChapter` | `academic/TeacherChapter.model.ts` | Same shape as `Chapter` but `contentType` is single video/text (not mixed content items), `teacherProgress[]` instead of `studentProgress[]` | Teacher-facing training chapters, parallel structure to `Chapter`. |
| `Assignment` | `assignment/Assignment.schema.ts` | `title`, `contentType` (video/text/pdf, conditionally required fields), `gradeId`, `questions[]`, `startDate`/`endDate`, `status` (active/locked/ended), `createdBy`, `totalMarks`/`passingMarks` | |
| `Submission` | `assignment/Submission.schema.ts` | `assignmentId`, `studentId`, `submissionType`, `answers[]` (quiz answers with correctness), `score`, `feedback`, `gradedBy`/`gradedAt` | |
| `Attendance` / `TeacherAttendance` | `attendance/Attendance.schema.ts`, `attendance/TeacherAttendance.schema.ts` | `studentId`, `teacherId`, `gradeId`, `date`, `status` (present/absent/late/excused), `remarks` | Structurally identical schemas, separate collections. Unique compound index `(studentId, date)`; date cannot be in the future. |
| `Token` | `auth/Token.model.ts` | `token` (unique), `userId` (ref `User`), `expiresAt` | Stores the active refresh token per user (upserted on rotation in `authenticate.ts`). |
| `PasswordResetToken` | `auth/PasswordResetToken.model.ts` | `userId`, `token` (unique), `expiresAt` (default now+15min), `isUsed` | |
| `ChatRoom` | `chat/Chat.model.ts` | `roomType` (direct/grade/broadcast), `participants[]` (userId, role, unreadCount, lastReadAt), `lastMessage` | |
| `Message` | `chat/Message.model.ts` | `senderId`/`senderRole`, `messageType` (broadcast/grade/unicast), `content`, `gradeId`, `recipients[]` (per-recipient read status), `attachments[]`, `isDeleted` | |
| `Query` | `query/Query.model.ts` | `from`/`to`, `subject`, `content`, `queryType`, `priority`, `status`, `isSensitive`, `attachments[]`, `responses[]` (threaded), `assignedTo`, `escalatedFrom`/`escalationReason`, `tags[]`, `satisfactionRating` | Support-ticket-style model with escalation workflow. |
| `Announcement` | `announcement.ts` | `title`, `content`, `type` (text/image/video), `mediaUrl`/`mediaPublicId`, `accentColor`, `isPinned`, `targetAudience` (all/specific), `targetGrades[]`, `createdBy` | |
| `Question` (schema, embedded) | `shared/Question.schema.ts` | `questionText`, `options[]` (exactly 4, validated), `correctAnswer`, `selectedAnswer` | Reused by `Chapter`, `TeacherChapter`, `Assignment`, `Submission`. |

**Cascading deletes**: `Admin`, `Student`, `Teacher`, and `Grade` all implement `deleteOne`/`findOneAndDelete` Mongoose hooks that manually clean up dependent documents and Cloudinary files (see also `utils/cascadingDelete.ts` and the `migrations/addCascadingDeletes.migration.ts` one-off backfill script). When adding a new model that references one of these, consider whether it needs to be added to the corresponding cascade hook.

## 6. Middleware ([server/src/middleware/](../server/src/middleware))

| File | Purpose |
|---|---|
| `authenticate.ts` | Verifies `Authorization: Bearer` or `accessToken` cookie; on expiry, verifies `refreshToken` cookie against the `Token` collection and rotates both tokens; attaches `req.userId`/`req.user`/`req.userRole`. Also exports `optionalAuth` (partially read — same pattern, non-blocking if absent). |
| `authorizeRoles.ts` | `authorizeRoles(...roles)` — runs after `authenticate`, loads the user's `role` from `User`, returns `403` if not in the allowed list. |
| `errorHandler.ts` | Central error formatter: maps `ApiError`, Mongoose `ValidationError`/`CastError`, duplicate-key `MongoServerError` (11000), and JWT errors to appropriate HTTP status codes; `notFoundHandler` produces a 404 `ApiError` for unmatched routes. |
| `profanity.ts` | `profanityFilter` — checks `req.body.content` with `bad-words-next`; sets `req.body.flagged = true` instead of rejecting the request. |
| `upload.ts` | Multer configured with in-memory storage, 50MB file size limit; exports `upload` and `uploadSingle` (`upload.single("file")`). |
| `validate.ts` | Wraps `express-validator`'s `validationResult`; throws `ApiError(400, <first message>)` if validation failed. |

## 7. Lib ([server/src/lib/](../server/src/lib))

| File | Purpose |
|---|---|
| `mongoose.ts` | `connectToDatabase()` / `disconnectFromDatabase()`, connects with `dbName: "scriptureschool"` and MongoDB Server API v1 (`strict: true`). |
| `socket.ts` | `initializeSocketIO(io)` — auth middleware verifies a JWT from `socket.handshake.auth.token`/`query.token` directly against `process.env.JWT_SECRET` (not via `utils/jwt.ts`); on connect, joins the user to a personal room (`user-<id>`) and role-appropriate grade rooms; handles `typing`/`status-update` events and broadcasts `user-status`. |
| `express_rate_limit.ts` | Default export: global limiter (100 req/min). Named exports: `messageRateLimit` (50/min, keyed by user), `chatCreationRateLimit` (5/15min), `searchRateLimit` (30/min, truncated in read — verify exact limit in file). |
| `chat.service.ts` | `ChatService.getOrCreateDirectRoom(user1Id, user2Id)` and `getOrCreateGradeRoom(gradeId)` — idempotent room lookup/creation helpers used by chat controllers. |
| `mail/` | `chapterReminder.ts`, `sendPasswordResetEmail.ts`, `sendStudentCredentialsEmail.ts`, `sendTeacherCredentialsEmail.ts` — Nodemailer-based email senders (not individually inspected; follow existing file for template/transport pattern before adding a new email type). |

## 8. Utils ([server/src/utils/](../server/src/utils))

| File | Purpose |
|---|---|
| `ApiError.ts` | `ApiError extends Error` with a `statusCode`; thrown throughout controllers/middleware and caught by `errorHandler`. |
| `jwt.ts` | `generateAccessToken`/`generateRefreshToken`/`verifyAccessToken`/`verifyRefreshToken`/`decodeToken`/`isTokenExpiringSoon`. Reads secrets from `process.env.JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` (throws if either is missing). Hardcodes expiry: access `7d`, refresh `30d` — **not** driven by `config.ts`'s `JWTACCESSTOKENEXPIRESIN`/`JWTREFRESHTOKENEXPIRESIN` fields. |
| `cascadingDelete.ts` | `batchDeleteCloudinaryFiles`, `extractCloudinaryFiles`, `extractSubmissionFiles`, `batchDeleteDocuments` (paginated bulk delete) — shared helpers used by the model-level cascade hooks in §5. |
| `email/transporter.ts` | Nodemailer transporter setup (not individually inspected — check this file for the exact SMTP env vars consumed before adding a new mail sender). |

## 9. Controllers Inventory ([server/src/controllers/v1/](../server/src/controllers/v1))

Full method/path/middleware mapping lives in [API.md](./API.md); this table lists every exported handler function per domain for quick lookup when navigating the code.

| Domain | File | Exported handlers |
|---|---|---|
| `admin` | `admin/index.ts` | `createAdminController`, `updateAdminController`, `deleteAdminController`, `getAdminByIdController`, `getAllAdminsController` |
| `announcement` | `announcement/index.ts` | `getAnnouncements`, `getAnnouncementById`, `createAnnouncement`, `updateAnnouncement`, `deleteAnnouncement`, `togglePin`, `getAnnouncementsForStudent` |
| `assignment` | `assignment/index.ts` | `createAssignment`, `createAssignmentForMultipleGrades`, `getAllAssignments`, `getAssignmentById`, `getAssignmentsByGrade`, `updateAssignment`, `deleteAssignment`, `getAssignmentSubmissions`, `getSubmissionsForMyAssignments` |
| `attendance` | `attendance/index.ts` | `createOrUpdateAttendance`, `getAttendanceByDate`, `getTodayAttendance`, `getAttendanceByGrade`, `getAttendanceStats`, `getTeacherStats`, `getAttendanceHeatmap`, `getTeacherHeatmap`, `exportAttendance`, `getStudentAttendance`, `deleteAttendance` |
| `auth` | `auth/index.ts` | `login`, `logout`, `refresh`, `verify`, `getProfile`, `forgotPassword`, `resetPassword` |
| `chapter` | `chapter/index.ts` | `createChapterHandler`, `createChapterForSingleGradeHandler`, `updateChapterHandler`, `getGradeChaptersHandler`, `getChaptersByUnitHandler`, `getChapterHandler`, `deleteChapterHandler`, `getChapterCountHandler`, `markChapterInProgressHandler`, `submitChapterHandler`, `getCompletedChaptersHandler`, `isChapterCompletedHandler`, `markChapterCompleteHandler`, `getChapterCompletedStudentsHandler`, `getChapterCompletionStatsHandler`, `getChapterTopPerformersHandler`, `getChapterPendingStudentsHandler`, `sendChapterReminderHandler`, `sendBulkChapterRemindersHandler`, `sendInProgressRemindersHandler`, `gradeWiseChapterCountHandler` |
| `chat` | `chat/index.ts` | `sendUnicastMessage`, `sendGradeMessage`, `sendBroadcastMessage`, `getConversation`, `getGradeMessages`, `getUnreadCount`, `markAsRead` |
| `chat` (rooms) | `chat/chatroom.ts` | `getOrCreateDirectRoom`, `getOrCreateGradeRoom`, `getMyRooms`, `updateLastRead`, `archiveRoom`, `getRoomMessages` |
| `dashboard` | `dashboard/index.ts` | `getPendingGradings`, `getSuperAdminDashboard`, `getAdminDashboard`, `getStudentDashboard`, `getTeacherDashboard` |
| `grade` | `grade/index.ts` | `createGradeHandler`, `listGradesHandler`, `getAllGradesHandler`, `getGradeByIdHandler`, `updateGradeHandler`, `deleteGradeHandler`, `addUnitToGradeHandler`, `updateUnitHandler`, `deleteUnitHandler`, `getGradeBasicInfoHandler`, `getTeacherUnitsHandler`, `addTeacherUnitHandler`, `updateTeacherUnitHandler`, `deleteTeacherUnitHandler`, `reorderTeacherUnitsHandler`, `getGradesByTeacherHandler`, `getGradeStudentsHandler`, `getGradeCompletionReport`, `getGradeCompletionReportById` |
| `queries` | `queries/index.ts` | `createQuery`, `getStudentQueries`, `getReceivedQueries`, `getQueryById`, `addResponse`, `updateQueryStatus`, `assignQuery`, `escalateQuery`, `addSatisfactionRating`, `getQueryStatistics`, `getAvailableRecipients` |
| `students` | `students/index.ts` | `registerStudent`, `modifyStudent`, `removeStudent`, `createStudentByTeacher`, `updateStudentByTeacher`, `deleteStudentByTeacher`, `fetchTeacherStudents`, `fetchTeacherStudentById`, `fetchTeacherStudentProgress`, `fetchStudentById`, `fetchStudents`, `fetchStudentProgress`, `markChapterCompleted`, `fetchStudentsByGrade` |
| `submission` | `submission/index.ts` | `submitAssignment`, `fetchSubmissions`, `fetchSubmissionById`, `modifySubmission`, `removeSubmission`, `gradeSubmission`, `fetchTeacherDashboard` |
| `superAdmin` | `superAdmin/index.ts` | `createSuperAdminController`, `updateSuperAdminController`, `deleteSuperAdminController`, `getSuperAdminByIdController`, `getAllSuperAdminsController` |
| `teacherAttendance` | `teacherAttendance/index.ts` | `createOrUpdateTeacherAttendance`, `getTeacherAttendanceByDate`, `getTodayTeacherAttendance`, `getTeacherAttendanceByGrade`, `getTeacherAttendanceStats`, `getTeacherAttendanceHeatmap`, `exportTeacherAttendance`, `getSpecificTeacherAttendance`, `deleteTeacherAttendance` |
| `teacherChapter` | `teacherChapter/index.ts` | `createTeacherChapterHandler`, `getTeacherChaptersHandler`, `getTeacherChapterHandler`, `updateTeacherChapterHandler`, `deleteTeacherChapterHandler`, `markTeacherChapterInProgressHandler`, `submitTeacherChapterHandler`, `isTeacherChapterCompletedHandler`, `getCompletedTeacherChaptersHandler` |
| `teachers` | `teachers/index.ts` | `createNewTeacher`, `updateTeacherDetails`, `removeTeacher`, `getTeacherById`, `getTeachersList`, `getTeachersTotalCount`, `getStudentTeacher`, `markChapterCompleted`, `getTeachersByGrade` |
| `todo` | `todo/index.ts` | `getStudentTodoOverview`, `getStudentAssignments`, `getStudentStreak` |

Note: `admin` and `superAdmin` controllers reuse `getAttendanceStats`, `getAttendanceHeatmap`, `exportAttendance` from the `attendance` domain (imported, not redefined) — see [routes/v1/admin/index.ts](../server/src/routes/v1/admin/index.ts).

## 10. Routes

Route mounting (`/api/v1/<domain>`) and per-endpoint middleware chains are fully documented in [API.md](./API.md) and [ROUTING.md](./ROUTING.md) — refer there rather than duplicating. Each `routes/v1/<domain>/index.ts` imports its handlers 1:1 from `controllers/v1/<domain>/index.ts` (see §9).

## 11. Known Issues / Gotchas (verified in code, not previously documented)

- **JWT env var mismatch**: [config/config.ts](../server/src/config/config.ts) declares `JWTACCESSTOKENSECRET`, `JWTREFRESHTOKENSECRET`, `JWTACCESSTOKENEXPIRESIN`, `JWTREFRESHTOKENEXPIRESIN` on its `Config` type, but nothing in the codebase reads `config.JWTACCESSTOKENSECRET` etc. The actual token signing/verification in [utils/jwt.ts](../server/src/utils/jwt.ts) reads **different** env var names directly — `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` — and hardcodes expiry (`7d` access, `30d` refresh) rather than using the `*EXPIRESIN` config values. **Set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`** in `server/.env` (not the `JWTACCESSTOKENSECRET`-style names from [SETUP.md](./SETUP.md)) for token auth to work; treat `SETUP.md`'s current JWT variable list as unverified until reconciled with this file.
- **Two independent JWT verification paths**: [lib/socket.ts](../server/src/lib/socket.ts) verifies Socket.IO handshake tokens against `process.env.JWT_SECRET` directly via the raw `jsonwebtoken` package, completely separate from the `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` pair used by `utils/jwt.ts` for REST auth. A token valid for one is not necessarily valid for the other — do not assume a single "the JWT secret" exists in this codebase.
- **Cascading deletes are manual, not `onDelete: CASCADE`**: `Admin`, `Student`, `Teacher`, and `Grade` schemas implement deletion side-effects via Mongoose `pre("deleteOne")`/`pre("findOneAndDelete")` hooks (see §5). Deleting via `Model.deleteMany()` or raw `updateOne` bypasses these hooks — always delete these four models via a document instance's `.deleteOne()` or `findOneAndDelete` to trigger cleanup.
