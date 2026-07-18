# Contributing

## Tooling & Commands

| Area | Command | Source |
|---|---|---|
| Client dev server | `cd client && npm run dev` (Turbopack) | [client/package.json](../client/package.json) |
| Client lint | `cd client && npm run lint` (`next lint`) | [client/eslint.config.mjs](../client/eslint.config.mjs) — extends `next/core-web-vitals`, `next/typescript` |
| Client autofix | `cd client && npm run clean:project` (`eslint "app/**/*.{js,ts,tsx,jsx}" --fix`) | [client/package.json](../client/package.json) |
| Client build | `cd client && npm run build` | `next.config.ts` sets `eslint.ignoreDuringBuilds: true`, so lint errors will not fail the build |
| Server dev server | `cd server && npm run dev` (nodemon + ts-node) | [server/nodemon.json](../server/nodemon.json) |
| Server type-check | `cd server && npm run lint` (`tsc --noEmit`) | [server/package.json](../server/package.json) |
| Server build | `cd server && npm run build` (`tsc`) | [server/tsconfig.json](../server/tsconfig.json) |

**No automated test framework** (Jest/Vitest/Mocha/etc.) is configured in either `client/package.json` or `server/package.json` — there is currently no `npm test` to run. Verify changes manually via the dev servers, and via `npm run lint`/`tsc --noEmit` for type safety.

## TypeScript

- Both projects use `strict: true` (see [client/tsconfig.json](../client/tsconfig.json) and [server/tsconfig.json](../server/tsconfig.json)).
- Client uses the `@/*` path alias for imports from the project root.

## Code Organization Conventions (observed)

- **Client**: feature code is organized by role (`admin`, `student`, `teacher`, `super-admin`) and by layer (`app` for routes, `components` for UI, `hooks` for data/state, `lib`/`utils` for API/services/validation, `types` for contracts). Follow the existing folder for a domain rather than introducing a new top-level grouping.
- API calls belong in a hook (`client/hooks/<role>/...`) or a service file (`client/lib/*` or `client/utils/*/*.service.ts`) — not directly inside page/component bodies.
- **Server**: each domain has a matching `routes/v1/<domain>` and `controllers/v1/<domain>` pair; keep this 1:1 mapping when adding new domains.
- Follow existing naming even where inconsistent (e.g. `client/components/admin/announcemnets` is intentionally *not* corrected to `announcements` without a coordinated rename of every import that references it — see [ARCHITECTURE.md](./ARCHITECTURE.md)).

## Before Opening a PR

1. Run `npm run lint` in whichever of `client`/`server` you changed (type-check for server, ESLint for client).
2. Run `npm run build` for the changed project(s) to confirm the TypeScript compiles.
3. Manually verify the affected flow against a running dev server — there is no test suite to fall back on.
4. If you add a new environment variable, document it in [SETUP.md](./SETUP.md) and, for backend variables, in [server/src/config/config.ts](../server/src/config/config.ts).
5. If you add a new API route, add it to [API.md](./API.md) with its exact method/path/middleware.

## Prettier

`prettier` is a devDependency in [client/package.json](../client/package.json), but no `.prettierrc`/`prettier.config.*` file exists in the repo — formatting rules are whatever Prettier's defaults produce; do not assume a custom style guide is enforced.
