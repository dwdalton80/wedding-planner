# Migration and Portability Playbook

## Goal

This playbook transfers the application from the current managed environment to a new owner, GitHub organization, database provider, host, and optional custom domain without relying on undocumented platform state.

## Transfer Inventory

| Asset | Source of truth | Must transfer? | Notes |
|---|---|---:|---|
| Source code | GitHub repository | Yes | Includes application, migrations, tests, and documentation. |
| Dependency lockfile | `pnpm-lock.yaml` | Yes | Preserve exact dependency graph. |
| Database schema | `drizzle/schema.ts` and `drizzle/*.sql` | Yes | Apply migrations in order. |
| Production planner data | Current MySQL/TiDB database export | Yes | Contains actual settings, budgets, and timeline events. |
| Environment values | Current host secret store | Recreate, do not copy into Git | Rotate/replace all secrets for the new owner. |
| Domain and DNS | Registrar/DNS provider accounts | If retaining domain | Requires account or registrar transfer. |
| Hosting configuration | Managed platform settings | Recreate | Current app is autoscale/serverless compatible. |
| Analytics account | Current analytics provider | Optional | Current analytics variables are platform injected. |
| OAuth/Forge/storage accounts | Current Manus integrations | Optional for active planner | Template routes exist but core planner does not rely on them. |

## Recommended Cutover Sequence

### 1. Preserve source ownership

1. Transfer or duplicate the GitHub repository into the acquiring organization.
2. Protect the main branch, enable dependency alerts, and require CI for changes.
3. Confirm the repository visibility matches the confidentiality of its content.
4. Create a release tag for the known-good migration baseline.

### 2. Establish a destination database

1. Provision MySQL 8+/TiDB-compatible database with automated backups and TLS.
2. Create separate migration and runtime database accounts.
3. Store a new `DATABASE_URL` in the destination secret manager.
4. Apply the committed migrations in order.
5. Import a sanitized production backup only after the destination schema is ready.

### 3. Deploy the application

1. Configure Node.js 22 and pnpm 10.
2. Install with `pnpm install --frozen-lockfile`.
3. Run `pnpm test`, `pnpm check`, and `pnpm build`.
4. Set at least `NODE_ENV=production` and `DATABASE_URL`.
5. Start with `pnpm start`; configure the host’s health and port settings.
6. Verify browser access, saving a budget line, guest scenario calculation, and timeline create/edit/reorder/delete operations.

### 4. Move the domain and DNS

1. Add the desired domain to the destination host.
2. Create the host-provided DNS record(s) at the authoritative DNS provider.
3. Verify certificate issuance and HTTPS redirects.
4. Confirm the application works on the custom domain before switching primary links.
5. Leave the old deployment online until DNS propagation and rollback window close.

### 5. Decommission previous ownership

1. Confirm database backups are restorable in the destination environment.
2. Rotate all old secrets and revoke previous owner access where contractually required.
3. Disable or delete old hosting only after final sign-off.
4. Keep evidence of source transfer, database export, DNS cutover, and credential rotation.

## Platform-Specific Dependencies to Resolve

The repository contains template-level Manus OAuth, storage proxy, analytics, and Forge configuration hooks. The current planner’s active budget and timeline features are not dependent on these services. A portability-focused owner should choose one of two paths:

| Path | Action |
|---|---|
| Retain platform features | Provision equivalent OAuth, storage, analytics, and Forge-style services; set new variables and test every retained route. |
| Simplify the product | Remove inactive OAuth, storage, analytics, and template code; keep only the planner API and database requirements. |

## Rollback Plan

If the destination release fails during cutover, route traffic back to the prior verified deployment, keep the destination database isolated, and restore the last known-good backup if data was modified. Do not use a database backup from a future schema state against an older application without testing compatibility.

## Acceptance Criteria

The transfer is complete only when a new owner can independently:

- access the source repository and GitHub Actions;
- create secrets in the destination host;
- deploy from a clean checkout;
- apply and verify database migrations;
- restore a database backup;
- manage the DNS/custom-domain account;
- run tests and TypeScript checks;
- explain and accept the current no-login access model or replace it.
