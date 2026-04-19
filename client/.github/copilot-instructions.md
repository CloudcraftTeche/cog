# Scripture School Frontend - Project Guidelines

## Project Overview

This is a **Next.js 15 (App Router)** frontend for "LOGOS - Smart Scripture School" - a Learning Management System for Church of God (Full Gospel) in India - Dubai. It handles student learning, teacher management, assignments, attendance, and real-time chat.

## Technology Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | React framework with App Router |
| React 19 | UI library |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Radix UI | Accessible component primitives |
| TanStack React Query | Server state management |
| React Hook Form | Form handling |
| Zod | Schema validation |
| Axios | HTTP client |
| Socket.IO Client | Real-time features |
| Sonner | Toast notifications |
| Recharts | Data visualization |
| Framer Motion | Animations |
| xlsx | Excel file handling |

## Architecture

```
client/
├── app/                    # Next.js App Router (pages & routes)
│   ├── layout.tsx          # Root layout (providers, fonts)
│   ├── page.tsx            # Entry point (auth redirect)
│   ├── login/              # Authentication pages
│   ├── dashboard/          # Protected dashboard routes
│   │   ├── layout.tsx      # Dashboard shell (sidebar, header)
│   │   ├── page.tsx        # Role-based dashboard switching
│   │   ├── admin/          # Admin-specific pages
│   │   ├── student/        # Student-specific pages
│   │   ├── teacher/        # Teacher-specific pages
│   │   └── super-admin/    # Super admin pages
│   └── unauthorized/       # Access denied page
├── components/             # Reusable UI components
│   ├── ui/                 # Base components (Button, Input, etc.)
│   ├── admin/              # Admin-specific components
│   ├── student/            # Student-specific components
│   ├── teacher/            # Teacher-specific components
│   ├── dashboard/          # Shared dashboard components
│   └── shared/             # Common components across roles
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts          # Authentication hook
│   ├── useSocket.ts        # WebSocket connection
│   ├── admin/              # Admin-specific hooks
│   ├── student/            # Student-specific hooks
│   └── teacher/            # Teacher-specific hooks
├── lib/                    # Core utilities
│   ├── api.ts              # Axios instance with interceptors
│   ├── utils.ts            # Helper functions (cn, etc.)
│   └── *Validation.ts      # Zod schemas
├── providers/              # React context providers
│   └── query-provider.tsx  # TanStack Query setup
├── types/                  # TypeScript type definitions
├── utils/                  # Service functions & helpers
│   ├── *.service.ts        # API service functions
│   └── *.utils.ts          # Utility helpers
└── public/                 # Static assets
```

## Key Patterns

### Routing (App Router)

File-based routing under `app/`:
- `page.tsx` = Route page component
- `layout.tsx` = Shared layout wrapper
- `loading.tsx` = Loading state
- `error.tsx` = Error boundary
- Folders = URL segments

```
app/dashboard/admin/assignments/page.tsx → /dashboard/admin/assignments
```

### Data Flow
```
Component → useHook() → serviceFunction() → api.get/post() → Backend
                ↓
         React Query (caching, refetching)
```

### Authentication Flow

1. **Entry Point** (`app/page.tsx`):
   - Checks auth via `useAuth()` hook
   - Redirects to `/dashboard` or `/login`

2. **Auth Hook** (`hooks/useAuth.ts`):
   - Manages user state from localStorage
   - Handles token verification/refresh
   - Provides `login()`, `logout()` functions

3. **API Interceptors** (`lib/api.ts`):
   - Auto-attaches JWT to requests
   - Handles 401 with token refresh
   - Stores tokens in localStorage

### Role-Based Rendering

```typescript
// app/dashboard/page.tsx
switch (user.role) {
  case "admin": return <AdminDashboard />;
  case "superAdmin": return <SuperAdminDashboard />;
  case "teacher": return <TeacherDashboard />;
  case "student": return <StudentDashboard />;
}
```

### React Query Pattern

```typescript
// hooks/useStudents.ts
export function useStudents(gradeId: string) {
  return useQuery({
    queryKey: ["students", gradeId],
    queryFn: () => fetchStudents(gradeId),
    staleTime: 60 * 1000,
  });
}

// Component usage
const { data, isLoading, error } = useStudents(gradeId);
```

### Form Pattern (React Hook Form + Zod)

```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
});
```

## User Roles

| Role | Access | Dashboard |
|------|--------|-----------|
| superAdmin | Full system, manage admins | SuperAdminDashboard |
| admin | Manage teachers, students | AdminDashboard |
| teacher | Chapters, assignments, attendance | TeacherDashboard |
| student | View chapters, submit work | StudentDashboard |

## Component Organization

### UI Components (`components/ui/`)
Base shadcn/ui components - Button, Input, Dialog, etc.

### Feature Components
Organized by role and feature:
```
components/admin/assignments/
├── AssignmentList.tsx
├── AssignmentForm.tsx
├── AssignmentCard.tsx
└── index.ts
```

### Naming Conventions
- Components: `PascalCase.tsx`
- Hooks: `use<Name>.ts`
- Services: `<name>.service.ts`
- Utils: `<name>.utils.ts`
- Types: `<name>.types.ts`

## Code Conventions

### Imports Order
1. React/Next.js
2. External libraries
3. Components
4. Hooks
5. Utils/Services
6. Types
7. Styles

### Component Pattern
```typescript
"use client"; // Only if needed (hooks, browser APIs)

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  title: string;
  onSubmit: () => void;
}

export function MyComponent({ title, onSubmit }: Props) {
  const [state, setState] = useState("");
  
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={onSubmit}>Submit</Button>
    </div>
  );
}
```

### Service Pattern
```typescript
// utils/student.service.ts
import api from "@/lib/api";

export async function fetchStudents(gradeId: string) {
  const response = await api.get(`/students?gradeId=${gradeId}`);
  return response.data;
}

export async function createStudent(data: CreateStudentDTO) {
  const response = await api.post("/students", data);
  return response.data;
}
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SERVERURL=http://localhost:5000/api/v1
```

## Build & Run

```bash
npm run dev      # Development with Turbopack
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint check
```

## Common Tasks

### Adding a New Page
1. Create folder in `app/dashboard/<role>/<feature>/`
2. Add `page.tsx` with component
3. Add to navigation in sidebar config

### Adding a New Feature
1. Create types in `types/<role>/<feature>.types.ts`
2. Create service in `utils/<role>/<feature>.service.ts`
3. Create hook in `hooks/<role>/use<Feature>.ts`
4. Create components in `components/<role>/<feature>/`
5. Create page in `app/dashboard/<role>/<feature>/page.tsx`

### Adding API Calls
1. Add function to relevant service file
2. Create/update React Query hook
3. Use hook in component

## Debugging Tips

### Console Logging
```typescript
console.log("Data:", data);
console.log("Loading:", isLoading);
console.log("Error:", error);
```

### Network Tab (Browser DevTools)
- Check API request/response
- Verify auth token in headers
- See error messages from server

### React DevTools
- Inspect component tree
- View props and state
- Track re-renders

### Clear Cache
```bash
rm -rf .next && npm run dev
```

## Project Context

- **Organization**: Church of God (Full Gospel) in India - Dubai
- **Product**: LOGOS - Smart Scripture School
- **Purpose**: Learning Management System for Sunday school
- **Users**: Students, Teachers, Admins, Super Admins
