# API Reference

Base URL: `{SERVER_URL}/api/v1` (mounted in [server/src/server.ts](../server/src/server.ts) via `app.use("/api/v1", v1Routes)`, defined in [server/src/routes/v1/index.ts](../server/src/routes/v1/index.ts)).

`GET /health` (server root) and `GET /api/v1/health` (API root) return service status; the latter also lists all mounted route prefixes.

All routes below use `authenticate` ([server/src/middleware/authenticate.ts](../server/src/middleware/authenticate.ts)) and/or `authorizeRoles` ([server/src/middleware/authorizeRoles.ts](../server/src/middleware/authorizeRoles.ts)) at the individual route level unless noted — see each route file for exact middleware chains, since usage is not uniform across every endpoint in this codebase.

## Auth — `/api/v1/auth`
Source: [server/src/routes/v1/auth/index.ts](../server/src/routes/v1/auth/index.ts)

| Method | Path | Notes |
|---|---|---|
| POST | `/login` | `loginValidation` + `validate` |
| POST | `/refresh` | Refresh access token from refresh-token cookie |
| GET | `/verify` | Verify current access token |
| POST | `/forgot-password` | `forgotPasswordValidation` + `validate` |
| POST | `/reset-password` | `resetPasswordValidation` + `validate` |
| POST | `/logout` | requires `authenticate` |
| GET | `/profile` | requires `authenticate` |
| GET | `/me` | requires `authenticate` (alias of `/profile`) |

## Admin — `/api/v1/admin`
Source: [server/src/routes/v1/admin/index.ts](../server/src/routes/v1/admin/index.ts)

| Method | Path | Notes |
|---|---|---|
| POST | `/` | Create admin |
| GET | `/` | requires `authenticate` — list admins |
| PUT | `/:id` | requires `authenticate` |
| DELETE | `/:id` | requires `authenticate` |
| GET | `/stats` | requires `authenticate` — attendance stats |
| GET | `/heatmap` | requires `authenticate` — attendance heatmap |
| GET | `/export/attendance` | requires `authenticate` |

## Super Admin — `/api/v1/superAdmins`
Source: [server/src/routes/v1/superAdmin/index.ts](../server/src/routes/v1/superAdmin/index.ts)

Same shape as Admin: `POST /`, `GET /` (auth), `PUT /:id` (auth), `DELETE /:id` (auth), `GET /stats` (auth), `GET /heatmap` (auth), `GET /export/attendance` (auth).

## Teachers — `/api/v1/teachers`
Source: [server/src/routes/v1/teachers/index.ts](../server/src/routes/v1/teachers/index.ts)

| Method | Path |
|---|---|
| POST | `/` |
| PUT | `/:id` |
| DELETE | `/:id` |
| GET | `/count` |
| GET | `/:id` |
| GET | `/` |
| POST | `/:id/complete-chapter` |
| GET | `/grade/:gradeId` |

## Students — `/api/v1/students`
Source: [server/src/routes/v1/students/index.ts](../server/src/routes/v1/students/index.ts)

| Method | Path |
|---|---|
| POST | `/` |
| GET | `/` |
| GET | `/grade/:gradeId` |
| GET | `/:id` |
| PUT | `/:id` |
| DELETE | `/:id` |
| POST | `/:id/complete-chapter` |
| GET | `/:id/progress` |
| POST | `/teacher/students` |
| GET | `/teacher/students` |
| GET | `/teacher/students/:id` |
| PUT | `/teacher/students/:id` |
| DELETE | `/teacher/students/:id` |
| GET | `/teacher/students/:id/progress` |

Note: `/teacher/students*` routes are the teacher-scoped student CRUD used by teacher pages (e.g. [client/app/dashboard/teacher/students](../client/app/dashboard/teacher/students)); non-prefixed routes are used by admin/super-admin pages.

## Grades & Units — `/api/v1/grades`
Source: [server/src/routes/v1/grade/index.ts](../server/src/routes/v1/grade/index.ts)

| Method | Path |
|---|---|
| POST | `/` |
| GET | `/completion-report` |
| GET | `/completion-report/:gradeId` |
| GET | `/` |
| GET | `/all` (auth) |
| GET | `/teacher/:teacherId` |
| GET | `/:id` |
| GET | `/:gradeId/students` |
| PUT | `/:id` |
| DELETE | `/:id` |
| POST | `/:id/units` |
| PUT | `/:id/units/:unitId` |
| DELETE | `/:id/units/:unitId` |
| GET | `/:id/basic` |
| GET | `/teacher/unit/all` (auth) |
| POST | `/teacher/unit` |
| PUT | `/teacher/unit/:unitId` |
| DELETE | `/teacher/unit/:unitId` |
| PATCH | `/teacher/unit/reorder` |

## Chapters — `/api/v1/chapters`
Source: [server/src/routes/v1/chapter/index.ts](../server/src/routes/v1/chapter/index.ts)

| Method | Path |
|---|---|
| POST | `/bulk` |
| POST | `/:gradeId/chapters` |
| PUT | `/:gradeId/chapters/:chapterId` |
| POST | `/:gradeId/chapters/:chapterId/submit` |
| GET | `/:gradeId/chapters` |
| GET | `/chapters` |
| GET | `/:gradeId/chapters/count` |
| GET | `/:gradeId/units/:unitId/chapters` |
| GET | `/:chapterId` |
| DELETE | `/:gradeId/chapters/:chapterId` |
| POST | `/:gradeId/chapters/:chapterId/start` |
| GET | `/:gradeId/students/:studentId/completed-chapters` |
| GET | `/:gradeId/chapters/:chapterId/status` |
| GET | `/:chapterId/completed-students` |
| GET | `/:gradeId/chapters/:chapterId/completion-stats` |
| GET | `/:chapterId/top-performers` |
| GET | `/:chapterId/pending-students` |
| POST | `/:chapterId/remind/:studentId` |
| POST | `/:chapterId/remind-all` |
| POST | `/:chapterId/remind-in-progress` |

## Teacher Chapters — `/api/v1/teacher-chapters`
Source: [server/src/routes/v1/teacherChapter/index.ts](../server/src/routes/v1/teacherChapter/index.ts)

| Method | Path |
|---|---|
| POST | `/` |
| GET | `/` |
| GET | `/teacher/:gradeId` |
| GET | `/:chapterId` |
| PUT | `/:chapterId` |
| DELETE | `/:chapterId` |
| POST | `/:chapterId/start` |
| POST | `/:chapterId/submit` |
| GET | `/:chapterId/status` |
| GET | `/teacher/:teacherId/completed` |

## Assignments — `/api/v1/assignments`
Source: [server/src/routes/v1/assignment/index.ts](../server/src/routes/v1/assignment/index.ts)

| Method | Path |
|---|---|
| GET | `/` |
| GET | `/grade/:gradeId` |
| GET | `/:assignmentId` |
| GET | `/:assignmentId/submissions` |
| GET | `/my/submissions/all` |
| POST | `/grade/:gradeId` |
| POST | `/multiple` |
| POST | `/` |
| PUT | `/:assignmentId` |
| DELETE | `/:assignmentId` |

## Submissions — `/api/v1/submissions`
Source: [server/src/routes/v1/submission/index.ts](../server/src/routes/v1/submission/index.ts)

| Method | Path |
|---|---|
| POST | `/` |
| GET | `/` |
| GET | `/teacher/dashboard` |
| GET | `/:id` |
| PUT | `/:id` |
| PUT | `/:id/grade` |
| DELETE | `/:id` |

## Announcements — `/api/v1/announcements`
Source: [server/src/routes/v1/announcement/index.ts](../server/src/routes/v1/announcement/index.ts)

| Method | Path | Notes |
|---|---|---|
| GET | `/` | |
| GET | `/student` | |
| GET | `/:id` | `oid("id")` param validation |
| POST | `/` | `uploadSingle` (Multer/Cloudinary) |
| PUT | `/:id` | `uploadSingle` |
| DELETE | `/:id` | `oid("id")` |
| PATCH | `/:id/pin` | |

## Attendance (Student) — `/api/v1/attendance`
Source: [server/src/routes/v1/attendance/index.ts](../server/src/routes/v1/attendance/index.ts)

| Method | Path |
|---|---|
| POST | `/` |
| GET | `/today` |
| GET | `/by-date` |
| GET | `/stats` |
| GET | `/stats/teacher/:teacherId` |
| GET | `/heatmap` |
| GET | `/heatmap/teacher/:teacherId` |
| GET | `/export` |
| GET | `/student/:studentId` |
| GET | `/grade/:gradeId` |
| DELETE | `/:attendanceId` |

## Teacher Attendance — `/api/v1/teacher-attendance`
Source: [server/src/routes/v1/teacherAttendance/index.ts](../server/src/routes/v1/teacherAttendance/index.ts)

| Method | Path |
|---|---|
| POST | `/` |
| GET | `/today` |
| GET | `/by-date` |
| GET | `/stats` |
| GET | `/heatmap` |
| GET | `/export` |
| GET | `/teacher/:teacherId` |
| GET | `/grade/:gradeId` |
| DELETE | `/:attendanceId` |

## Chat (unicast/broadcast) — `/api/v1/chat`
Source: [server/src/routes/v1/chat/index.ts](../server/src/routes/v1/chat/index.ts)

| Method | Path |
|---|---|
| POST | `/unicast` |
| POST | `/grade` |
| POST | `/broadcast` |
| GET | `/conversation/:otherUserId` |
| GET | `/grade/:gradeId` |
| GET | `/unread-count` |
| POST | `/mark-read` |

## Chat Rooms — `/api/v1/chatrooms`
Source: [server/src/routes/v1/chat/chatRoom.ts](../server/src/routes/v1/chat/chatRoom.ts)

| Method | Path |
|---|---|
| GET | `/my-rooms` |
| GET | `/direct/:otherUserId` |
| GET | `/grade/:gradeId` |
| GET | `/:roomId/messages` |
| PUT | `/:roomId/read` |
| DELETE | `/:roomId` |

## Queries (support tickets) — `/api/v1/queries`
Source: [server/src/routes/v1/queries/index.ts](../server/src/routes/v1/queries/index.ts)

| Method | Path |
|---|---|
| POST | `/` |
| GET | `/my-queries` |
| GET | `/recipients` |
| GET | `/received` |
| GET | `/:id` |
| POST | `/:id/response` |
| PATCH | `/:id/status` |
| PATCH | `/:id/assign` |
| POST | `/:id/escalate` |
| POST | `/:id/rating` |
| GET | `/statistics/overview` |

## Todo — `/api/v1/todo`
Source: [server/src/routes/v1/todo/index.ts](../server/src/routes/v1/todo/index.ts)

| Method | Path |
|---|---|
| GET | `/overview` |
| GET | `/assignments` |
| GET | `/streak` |

## Dashboard (role-aggregated stats) — `/api/v1/dashboard`
Source: [server/src/routes/v1/dashboard/index.ts](../server/src/routes/v1/dashboard/index.ts)

| Method | Path | Notes |
|---|---|---|
| GET | `/super-admin` | requires `authenticate` |
| GET | `/admin` | requires `authenticate` |
| GET | `/teacher` | requires `authenticate` |
| GET | `/student` | requires `authenticate` |

## Error Responses

Centralized in [server/src/middleware/errorHandler.ts](../server/src/middleware/errorHandler.ts) (`notFoundHandler` for unmatched routes, `errorHandler` for thrown/forwarded errors). Auth failures follow the shape:

```json
{ "code": "AuthenticationError", "message": "..." }
```

Authorization failures (from `authorizeRoles`) follow:

```json
{ "success": false, "message": "Unauthorized access: insufficient permissions" }
```
