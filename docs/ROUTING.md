# Routing

## Frontend — Next.js App Router

Reference: [client/app](../client/app)

```
client/app/
├── layout.tsx                 # Root layout: fonts, QueryProvider, Toaster
├── page.tsx                   # "/" — redirects to /dashboard or /login based on auth
├── login/page.tsx             # "/login"
├── forget-password/page.tsx   # "/forget-password"
├── reset-password/page.tsx    # "/reset-password"
├── unauthorized/page.tsx      # "/unauthorized"
└── dashboard/
    ├── layout.tsx              # Shared shell: Sidebar + DashboardHeader, gated by useAuth()
    ├── page.tsx                 # "/dashboard" — renders role-specific dashboard component
    ├── admin/**                 # "/dashboard/admin/..."
    ├── super-admin/**           # "/dashboard/super-admin/..."
    ├── teacher/**               # "/dashboard/teacher/..."
    └── student/**               # "/dashboard/student/..."
```

### Root redirect logic

[client/app/page.tsx](../client/app/page.tsx) uses `useAuth` (from `client/hooks/useAuth.ts`) and `useEffect` to `router.push('/dashboard')` if a user is present, or `router.push('/login')` otherwise, showing a loading spinner while `user === undefined`.

### Dashboard layout

[client/app/dashboard/layout.tsx](../client/app/dashboard/layout.tsx) reads `user`, `logout`, `isLoading` from `useAuth` (`client/hooks/auth/useAuth.ts`), shows `LoadingScreen` while loading, and otherwise renders `Sidebar` (role-aware via `userRole={user?.role}`) plus `DashboardHeader` around `{children}`.

### Route groups per role

Each of `admin`, `super-admin`, `teacher`, `student` has a parallel set of feature routes (announcements, assignments, attendance, chapters, chat, grades, profile, queries, students/teachers, teacher-attendance, teacher-chapters, gradeReport). `admin` and `super-admin` share nearly identical route trees and the same underlying `admin/*` components. Dynamic segments follow Next.js conventions, e.g.:

- `/dashboard/admin/assignments/edit/[id]`
- `/dashboard/student/chapters/[id]`
- `/dashboard/teacher/my-chapters/[id]`

### Route protection

There is no centralized Next.js `middleware.ts` route guard in this codebase. Auth/role gating is done per-layout/page via the `useAuth` hooks and client-side redirects (e.g. `/unauthorized` page exists as a target for disallowed access, and `dashboard/layout.tsx` blocks rendering while `isLoading`). Treat this as a known gap, not an assumption — no `client/middleware.ts` file exists.

## Backend — Express Routing

Reference: [server/src/routes/v1/index.ts](../server/src/routes/v1/index.ts)

All domain routers are mounted under a single `/api/v1` prefix in `server/src/server.ts`:

```
/api/v1/auth
/api/v1/admin
/api/v1/superAdmins
/api/v1/teachers
/api/v1/students
/api/v1/dashboard
/api/v1/grades
/api/v1/chapters
/api/v1/teacher-chapters
/api/v1/assignments
/api/v1/submissions
/api/v1/announcements
/api/v1/chat
/api/v1/chatrooms
/api/v1/queries
/api/v1/attendance
/api/v1/teacher-attendance
/api/v1/todo
```

See [API.md](./API.md) for the full per-route method/path breakdown. Route-level middleware (`authenticate`, `authorizeRoles`, validators) is applied per-endpoint inside each domain's `routes/v1/<domain>/index.ts` file rather than globally, so protection level varies by endpoint — always check the specific route file rather than assuming a blanket auth policy.
