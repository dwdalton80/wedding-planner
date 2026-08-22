# Operations Runbook

## Deployment Modes

The application is a conventional Node.js web service. It can run on the current Manus managed autoscale platform or on another Node-compatible host that provides a persistent SQL database and injected environment variables.

| Concern | Current managed deployment | Portable alternative |
|---|---|---|
| App runtime | Manus autoscale container runtime. | Any host that runs Node 22 and supports an HTTP process. |
| App domain | `kyiawedding-babcyca9.manus.space`. | Custom domain connected through a DNS provider and host certificate flow. |
| Database | Platform-provisioned MySQL/TiDB-compatible service. | Managed MySQL/TiDB, Amazon RDS, PlanetScale-compatible alternative, or self-managed MySQL. |
| Secrets | Platform-managed injected environment variables. | Host secret manager or encrypted deployment variables. |
| Analytics | Platform-injected analytics script variables. | New analytics provider or remove analytics snippet. |

## Standard Build and Release

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm check
pnpm build
NODE_ENV=production pnpm start
```

The production build writes a Vite client bundle and an esbuild server bundle to `dist/`. The process serves the built client and tRPC API from the same Express server.

**Latest handoff validation:** the built server was started with `PORT=3017 NODE_ENV=production pnpm start`; a same-origin `planner.get` tRPC response returned live settings, planner items, and `timelineEvents`. This confirms the production bundle can reach the configured planner database. Repeat this smoke test in every destination environment after credentials and migrations are applied.

## Database Migration Procedure

1. Pull the target branch and confirm the intended `drizzle/` migration files are present.
2. Set `DATABASE_URL` to the target database using a migration-capable credential.
3. Generate a migration only when `drizzle/schema.ts` has changed: `pnpm drizzle-kit generate`.
4. Read the generated SQL. Do not apply destructive DDL without a tested backup and explicit approval.
5. Apply committed migrations with `pnpm drizzle-kit migrate`.
6. Run a smoke check: load the app, confirm planner settings, budget lines, and timeline events.
7. Record the migration version and release commit in operational notes.

The repository currently contains migrations that create `planner_items`, `planner_settings`, and `planner_timeline_events`. Schema and data are independent: applying migrations creates tables but does not reproduce the current live planner content.

### Isolated migration verification

Use the following command with `MIGRATION_DATABASE_URL` set to a database account that is permitted to create and drop a temporary database on the target server:

```bash
pnpm verify:migrations
```

The script derives a timestamped temporary database name from `DATABASE_URL`, applies the committed Drizzle migrations to that empty database through `MIGRATION_DATABASE_URL`, verifies the expected planner tables, and drops the temporary database in a cleanup block. It never writes to the database named in `DATABASE_URL`. The current managed runtime’s application credential is intentionally restricted and cannot create temporary databases, so this separate migration credential is required for a successful isolated verification there.

**Handoff status:** the repository includes the isolated verification command, but this environment could not complete it because no valid DDL-capable migration credential was provided. The destination owner must run `pnpm verify:migrations` with a reachable `MIGRATION_DATABASE_URL` before a production migration or ownership cutover.

## Backup and Restore

### Backup

At minimum before a release, owner transfer, or schema change:

```bash
mysqldump --single-transaction --routines --triggers \
  --databases YOUR_DATABASE_NAME > planner-backup.sql
```

Use provider-supported export tooling when direct `mysqldump` access is unavailable. Store encrypted backups outside the source repository. Record which schema migration set and commit SHA correspond to each backup.

### Restore and verify

1. Create an isolated destination database.
2. Apply the SQL backup or import table data.
3. Apply only migrations newer than the backup’s schema version.
4. Run the application against the restored database.
5. Verify one settings row, twenty-one wedding items, six honeymoon items, and expected timeline events.
6. Test a non-destructive change in a non-production environment.

## Monitoring and Incident Response

| Signal | Recommended response |
|---|---|
| App returns 5xx | Check runtime logs, database connectivity, `DATABASE_URL`, and recent migration changes. |
| Planner fails to load | Confirm `/api/trpc` routes reach the app and that the database is available. |
| Changes do not persist | Check API mutation errors, DB credential grants, and `updatedAt` values. |
| Timeline order appears wrong | Inspect `planner_timeline_events.sortOrder`; the UI follows this column, not time. |
| Suspected unauthorized access | Disable public exposure at the host, rotate credentials, restore from backup if needed, and prioritize authentication. |

The current source does not implement health, readiness, metrics, error-tracking, or uptime endpoints. Add a protected operational health endpoint and external monitoring before relying on the app for business-critical use.

## Hosting and DNS Notes

The current published domain is a platform-managed subdomain. Moving to another host requires creating a new deployment, setting the application’s environment variables, applying database migrations, then pointing the desired domain’s DNS records to the new host according to that host’s instructions. Maintain the old deployment until DNS propagation and production verification are complete.

For a custom domain, document the registrar account owner, authoritative DNS provider, record types, TTLs, certificate ownership, renewal process, and any proxy/CDN configuration. DNS is an external ownership dependency; it cannot be recreated from this repository alone.
