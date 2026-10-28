# Changelog

All notable changes to COG (Scripture School) are recorded here. The project follows [Semantic Versioning](https://semver.org/), and the client and server share one version number.

## [Unreleased]

Planned next: new game types (memory verse builder, story order, thumbs up/down, missing word), games drafted from the textbook and approved by admins and teachers, and games replacing the quiz for Grades 1-5.

## [1.2.0] - 2026-10-28

### Chapter games

- Chapter games now come from the database instead of being built into the app, and answers are checked on the server, so they are never sent to the student's phone (LOGOS-53, LOGOS-59).
- New game screen for every game: instructions, a progress bar, stars for the score, a celebration, Play Again, and a sound on/off button that the device remembers (LOGOS-59).
- Matching works by dragging with a finger, mouse or pen, or by tapping a word and then its match (LOGOS-59).
- In Scrambled Words, a child can move on after two wrong tries so nobody gets stuck (LOGOS-59).
- Finishing every game in a chapter completes the chapter. Finishing a game also starts the chapter if it had not been started (LOGOS-59).
- The existing Grade 1 games (chapters 1-10 and 18) moved into the new system (LOGOS-57).

### Grade 1 content

- Grade 1 now follows its textbook: 6 units and 35 chapters, each with its Bible reading and memory verse (LOGOS-153).
- The textbook's lessons are stored in a protected lesson library that only admins and teachers can read, never students (LOGOS-90).

### Backups

- The database is backed up every night to Backblaze B2, encrypted, with 7 daily, 4 weekly and 3 monthly copies kept, an email if a backup fails, and a monthly restore test (LOGOS-129).

### Fixes

- Grade 1 Chapter 18 activities could not be submitted (LOGOS-46).
- Removed an unneeded back arrow from the game header (LOGOS-155).

### Upgrade notes

- **Already applied to production on 2026-10-28** (each after a backup): Grade 1 lessons loaded (`npm run load:lessons`), Grade 1 reset to 6 units and 35 chapters (`npm run migrate:grade1-reset`), existing Grade 1 games copied into `chaptergames` (`npm run migrate:grade1-games`). All three refuse to run twice.
- New collections: `lessons`, `chaptergames`.
- New API routes: `GET /api/v1/lessons`, `GET /api/v1/lessons/:id` (admin, superAdmin, teacher for own grade); `/api/v1/chapter-games` (staff create, edit, publish, delete; students play, check and submit). See `docs/API.md`.
- New scripts in `server/`: `extract:lessons`, `load:lessons`, `migrate:grade1-reset`, `migrate:grade1-games`. New dev dependency: `pdfjs-dist`.
- New GitHub Actions workflows: DB backup (nightly) and DB restore test (monthly); secrets are described in `docs/BACKUP.md`.
- The old `POST /chapters/:gradeId/chapters/:chapterId/complete` endpoint is kept for app versions cached on phones and will be removed in a later release.

## [1.1.0] - 2026-10-21

### Installable app (PWA)

- Logos can be installed to the home screen on Android, iPhone, iPad and desktop, with its own icon and splash screens. Students, teachers, admins and super admins see an install prompt on the dashboard (LOGOS-18, LOGOS-34, LOGOS-38).
- A "new version available" prompt appears when an update is deployed (LOGOS-18).
- The app is online-first. It never stores lessons or account data on the device, only the app's own files (LOGOS-25).
- Losing the connection is handled clearly: an offline banner, friendly error messages, data refresh on reconnect, and submit buttons disabled while offline. If the connection drops as an activity finishes, the answers are kept for a retry (LOGOS-25).
- A browser test checks that sign-in data is never cached and that an expired session still sends the user to login (LOGOS-41).

### Attendance

- Admin and super-admin attendance overview: a student attendance report with date and grade filters, paging and CSV export (LOGOS-128).

### Fixes

- Teacher dashboard header no longer covers the menu on phones, and the admin dashboard tabs fit a phone screen (LOGOS-34).
- Offline page button contrast (LOGOS-41).

### Other

- The app version is shown at the bottom of the sidebar (LOGOS-13).
- Release process documented in `docs/RELEASING.md` (LOGOS-13).

### Upgrade notes

- No database migrations. New API route: `GET /api/v1/attendance/report` (admin, superAdmin).

## [1.0.0] - 2026-10-20

First tagged release. It marks the system as it stands in production before the v2 work starts.

### Roles

- Four roles: student, teacher, admin and super admin, each with its own dashboard.
- Login with JWT access and refresh tokens, silent token refresh, and forgot/reset password by email.

### Academics

- Grades with units, and chapters per grade and unit with text, video and PDF content.
- Chapter quizzes with scoring, chapter locking and progression, and retakes.
- A separate chapter track for teachers.
- Grade 1 chapter activities (scrambled words, matching, colouring) that are recorded as part of chapter progress.

### Assignments

- Assignments with file and text submissions, grading, and grade-scoped filtering.
- Assignment reports for admins, including text responses.

### Attendance

- Student attendance marked by teachers.
- Teacher attendance with an admin dashboard and report.

### Communication

- Real-time chat over Socket.IO with grade rooms and a profanity filter.
- Announcements, student queries to teachers and admins, and a to-do list.

### Admin

- Dashboards with statistics and grade reports for admins and super admins.
- Student and teacher management shown in data tables.
- File uploads stored on Cloudinary, cleaned up automatically when records are deleted.

[Unreleased]: https://github.com/CloudcraftTeche/cog/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/CloudcraftTeche/cog/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/CloudcraftTeche/cog/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/CloudcraftTeche/cog/releases/tag/v1.0.0
