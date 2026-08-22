# Maintenance and Development Conventions

## Development Workflow

1. Create a focused branch from `main`.
2. Update documentation and `todo.md` for user-visible feature work.
3. Make schema changes first when a feature requires persistence.
4. Generate and review a Drizzle migration.
5. Add database helpers in `server/db.ts`.
6. Add Zod-validated tRPC procedures in `server/routers.ts`.
7. Connect the UI through `trpc.*` hooks and invalidate relevant queries after mutations.
8. Add or update Vitest coverage.
9. Run `pnpm test && pnpm check && pnpm build`.
10. Review responsive desktop and mobile behavior before merging.

## Code Conventions

| Area | Convention |
|---|---|
| Money | Persist integer cents, never floating-point dollars. |
| Planner state | Treat database state as canonical; compute display rollups on the client from current API data. |
| API | Use tRPC procedures and Zod validation; do not add ad hoc fetch wrappers. |
| Data writes | Return `getPlannerState()` after mutations so client cache can refresh. |
| Timeline | Preserve explicit `sortOrder`; do not infer user order from `eventTime`. |
| UI | Use the established burgundy/gold/sage variables and Georgia editorial heading treatment. |
| Components | Split new feature sections out of `Home.tsx` before its complexity becomes a maintenance burden. |
| Tests | Keep pure helpers in `shared/` and route behavior in `server/*.test.ts`. |

## Testing Standard

Run the full verification set before release:

```bash
pnpm test
pnpm check
pnpm build
```

Current automated coverage validates starter data, category rollups, budget reconciliation, countdown behavior, public planner API access, planner mutations, timeline lifecycle mutations, and the template logout route. It does not yet include browser-driven end-to-end coverage or concurrent-update testing.

## Database Change Rules

1. Do not edit a production table manually when a Drizzle migration can describe the change.
2. Read generated SQL before applying it.
3. Take a restorable backup before destructive or high-risk changes.
4. Apply migrations in a staging database before production.
5. Avoid deleting identifiers used by restore behavior or existing API calls without a compatibility plan.
6. Use a transaction for future multi-row updates that require atomicity.

## Scaling Roadmap

If this project becomes a product beyond one couple, prioritize the following order:

1. Add authentication, workspaces, memberships, and role-based procedures.
2. Scope every table and query by workspace ID.
3. Add audit logs and revision history.
4. Add rate limiting, error tracking, health checks, and monitoring.
5. Separate dashboard modules and introduce a domain service layer.
6. Add exports/imports, attachments through object storage, and vendor/due-date models.
7. Add end-to-end tests and an infrastructure-as-code deployment description.
