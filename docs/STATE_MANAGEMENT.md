# State Management

## Server State — TanStack React Query

The app uses `@tanstack/react-query` v5 as the primary server-state layer.

- **Provider**: [client/providers/query-provider.tsx](../client/providers/query-provider.tsx) creates a single `QueryClient` per app instance (`useState` initializer) with:
  - `staleTime: 60_000` (60s)
  - `refetchOnWindowFocus: false`
  - `retry: 1`
- Wrapped around the entire app in [client/app/layout.tsx](../client/app/layout.tsx).
- Domain hooks under `client/hooks/**` (e.g. `client/hooks/admin/useGrades.ts`, `client/hooks/student/useChapters.ts`, `client/hooks/teacher/useTeacherDashboard.ts`) wrap `useQuery`/`useMutation` around calls into `client/lib/api.ts` or domain service files in `client/lib`/`client/utils`.
- Query keys are defined per-hook-file (e.g. `chapterKeys`, `gradeKeys`, `queryKeys`, `teacherKeys`) rather than in one central registry — check the relevant hook file for the exact key shape before adding new queries/mutations for that domain.
- Data flow: **page → hook → Axios client → backend → query cache → UI**.

## Authentication State

Two separate hook implementations exist and are both actively used — treat them as distinct, not interchangeable:

| Hook | File | Used by |
|---|---|---|
| `useAuth` | [client/hooks/useAuth.ts](../client/hooks/useAuth.ts) | [client/app/page.tsx](../client/app/page.tsx), [client/components/teacher/attendance/HistoryView.tsx](../client/components/teacher/attendance/HistoryView.tsx), etc. Manages `user`/`token`/`isLoading`/`isAuthenticated` in local `useState`, reading/writing `localStorage` (`user`, `accessToken`) directly, with a periodic re-verify interval. |
| `useAuth` | [client/hooks/auth/useAuth.ts](../client/hooks/auth/useAuth.ts) | [client/app/dashboard/layout.tsx](../client/app/dashboard/layout.tsx), dashboard pages/chat. Thin wrapper around `useAuthQuery` ([client/hooks/auth/useAuthQuery.ts](../client/hooks/auth/useAuthQuery.ts)), i.e. backed by TanStack Query rather than plain `useState`. |

Token storage constants live in [client/lib/auth/constant/auth.ts](../client/lib/auth/constant/auth.ts) (`TOKEN_STORAGE_KEYS`, `TOKEN_TIMING`); storage helpers live in [client/utils/auth/auth-storage.ts](../client/utils/auth/auth-storage.ts).

The Axios client ([client/lib/api.ts](../client/lib/api.ts)) independently reads `accessToken` from `localStorage` for the `Authorization` header, and implements its own 401 → refresh → retry queue in the response interceptor, decoupled from either `useAuth` implementation.

## Local Component State

Plain React state (`useState`, `useMemo`, `useCallback`, `useEffect`, `useRef`) is used extensively in pages, components, and hooks for UI state (filters, form fields, modals, pagination) — there is no separate client-side global store (no Redux, no Zustand, no custom React Context beyond `QueryClientProvider`).

## Realtime State

[client/hooks/useSocket.ts](../client/hooks/useSocket.ts) manages the Socket.IO client connection lifecycle (connect/disconnect, event subscriptions) and is consumed directly by chat pages (`client/app/dashboard/{admin,student,teacher,super-admin}/chat/page.tsx`) rather than through React Query.

## Adding New Server State

1. Add or extend a hook file in the relevant `client/hooks/<role>/` folder.
2. Define a query key constant/function scoped to that file (follow the existing `*Keys` naming pattern used in sibling hooks).
3. Call the Axios client (`client/lib/api.ts`) or an existing service helper in `client/lib`/`client/utils`.
4. Consume the hook from the page/component; do not call the API client directly from components.
