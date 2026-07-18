---
description: "Frontend conventions for the client/ Next.js app — routing, state management, API calls, and code organization. Applies when editing files under client/."
applyTo: "client/**"
---

# Client (Next.js Frontend) Instructions

## Stack

Next.js 15 App Router, React 19, TypeScript (`strict: true`), Tailwind CSS v4, Radix UI/shadcn-style components, TanStack Query v5, Axios, Socket.IO client, Sonner (toasts), Recharts, XLSX. Path alias `@/*` resolves from the project root.

## Data Flow

**page → hook → Axios client (`client/lib/api.ts`) → backend (`/api/v1`) → TanStack Query cache → UI**

- API calls belong in a hook (`client/hooks/<role>/...`) or a service file (`client/lib/*` / `client/utils/*/*.service.ts`) — never call the Axios client directly from a page/component body.
- Query keys are defined per-hook-file (e.g. `chapterKeys`, `gradeKeys`, `queryKeys`, `teacherKeys`), not in a central registry. Check the sibling hook file for the existing key shape before adding new queries/mutations in that domain.
- `QueryClient` (staleTime 60s, `refetchOnWindowFocus: false`, retry 1) is created once in [client/providers/query-provider.tsx](../../client/providers/query-provider.tsx) and wraps the app in [client/app/layout.tsx](../../client/app/layout.tsx).
- No Redux/Zustand/custom global React Context — local UI state uses `useState`/`useMemo`/`useCallback`/`useEffect`/`useRef`.

## Authentication — Two Distinct Hooks (do not conflate)

| Hook | File | Backing | Used by |
|---|---|---|---|
| `useAuth` | `client/hooks/useAuth.ts` | Plain `useState` + `localStorage`, periodic re-verify | `client/app/page.tsx` and some feature components |
| `useAuth` | `client/hooks/auth/useAuth.ts` | Wraps `useAuthQuery` (TanStack Query) | `client/app/dashboard/layout.tsx` and dashboard pages/chat |

Check which one a file already imports before adding auth logic — they are not interchangeable. The Axios client independently reads `accessToken` from `localStorage` for its own 401 → refresh → retry-queue logic, decoupled from both hooks.

## API Client

[client/lib/api.ts](../../client/lib/api.ts) is a single Axios instance: `baseURL = process.env.NEXT_PUBLIC_SERVERURL` (must include `/api/v1`), `withCredentials: true`, request interceptor attaches `Authorization: Bearer <token>` from `localStorage`, response interceptor handles 401 refresh + queued retry (excludes `/auth/login`, `/auth/verify`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`).

## Routing

- App Router under `client/app/`; role-based routes live under `client/app/dashboard/{admin,super-admin,teacher,student}/...`.
- No centralized `middleware.ts` route guard exists — auth/role gating happens per-layout/page via the `useAuth` hooks and client-side redirects. Don't assume route-level protection beyond what a given layout/page implements.
- `admin` and `super-admin` share nearly identical route trees and the same underlying `admin/*` components — check both when changing shared behavior.

## Code Organization

- Feature code is organized by role (`admin`, `student`, `teacher`, `super-admin`) and by layer (`app` for routes, `components` for UI, `hooks` for data/state, `lib`/`utils` for API/services/validation, `types` for contracts). Follow the existing folder for a domain rather than introducing a new top-level grouping.
- Follow existing naming even where inconsistent (e.g. `client/components/admin/announcemnets` is intentionally not renamed to `announcements` without a coordinated rename of every referencing import).

## Linting & Build

- `npm run lint` runs `next lint` (extends `next/core-web-vitals`, `next/typescript`).
- `npm run clean:project` runs `eslint "app/**/*.{js,ts,tsx,jsx}" --fix`.
- `next.config.ts` sets `eslint.ignoreDuringBuilds: true` — lint errors will NOT fail `npm run build`; run lint separately.
- No test framework configured — verify changes manually via `npm run dev`.
