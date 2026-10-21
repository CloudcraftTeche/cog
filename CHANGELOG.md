# Changelog

All notable changes to COG (Scripture School) are recorded here. The project follows [Semantic Versioning](https://semver.org/), and the client and server share one version number.

## [Unreleased]

Planned for 2.0.0: a game engine for KG1 to Grade 5 chapters, and textbook-based game generation.

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

[Unreleased]: https://github.com/CloudcraftTeche/cog/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/CloudcraftTeche/cog/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/CloudcraftTeche/cog/releases/tag/v1.0.0
