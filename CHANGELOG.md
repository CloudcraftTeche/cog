# Changelog

All notable changes to COG (Scripture School) are recorded here. The project follows [Semantic Versioning](https://semver.org/), and the client and server share one version number.

## [Unreleased]

Planned for 2.0.0: installable PWA for all roles, a game engine for KG1 to Grade 5 chapters, and textbook-based game generation.

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

[Unreleased]: https://github.com/CloudcraftTeche/cog/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/CloudcraftTeche/cog/releases/tag/v1.0.0
