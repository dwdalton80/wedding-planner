# Environment and Configuration Guide

## Configuration Principles

Keep all credentials outside version control. Start from `config/environment.template`, store local development values in `.env`, and use the hosting provider’s encrypted environment-variable facility in production. Do not put database URLs, Forge keys, session secrets, tokens, or exported production data into GitHub issues, commits, screenshots, or documentation.

## Environment Variables

| Variable | Required for active planner? | Purpose | Transfer action |
|---|---:|---|---|
| `NODE_ENV` | Recommended | Selects development Vite middleware or production static serving. | Set to `development` locally and `production` in hosted environments. |
| `PORT` | Recommended | Preferred HTTP port; runtime chooses the next open port if unavailable. | Let most cloud hosts inject it. |
| `DATABASE_URL` | **Yes** | MySQL/TiDB connection used by Drizzle and the planner data layer. | Create a new database, issue a least-privilege application credential, and store a new connection URL. |
| `MIGRATION_DATABASE_URL` | Recommended for operations | Optional DDL-capable MySQL/TiDB connection used only by `pnpm verify:migrations`. | Create a separate migration account; leave unset only when the runtime account has database creation and migration rights. |
| `JWT_SECRET` | Only if retaining OAuth/session template routes | Session-cookie signing key used by template auth. | Generate a new high-entropy value; never transfer the old key in source control. |
| `VITE_APP_ID` | Only if retaining Manus OAuth client flow | Manus application identifier exposed to the client. | Recreate in the new authentication platform or remove OAuth client code. |
| `OAUTH_SERVER_URL` | Only if retaining Manus OAuth | OAuth service endpoint. | Reconfigure for replacement identity provider or remove unused routes. |
| `VITE_OAUTH_PORTAL_URL` | Only if retaining Manus OAuth client flow | Browser login portal base URL. | Reconfigure or remove. |
| `OWNER_OPEN_ID` | Only if retaining template user roles | Identifies the template’s owner user. | Reconfigure or remove. |
| `BUILT_IN_FORGE_API_URL` | No for current planner features | Manus server-side Forge API base URL, used by optional template services. | Replace or remove if optional services are not retained. |
| `BUILT_IN_FORGE_API_KEY` | No for current planner features | Manus server-side Forge API credential. | Do not export; issue a new credential only if optional services are retained. |
| `VITE_FRONTEND_FORGE_API_URL` | No for current planner features | Optional Manus frontend Forge endpoint. | Replace or remove. |
| `VITE_FRONTEND_FORGE_API_KEY` | No for current planner features | Optional Manus frontend Forge credential. | Replace or remove. |
| `VITE_ANALYTICS_ENDPOINT` | No for functional planner behavior | Platform-injected analytics script endpoint. | Reconfigure a new analytics provider or remove the script. |
| `VITE_ANALYTICS_WEBSITE_ID` | No for functional planner behavior | Analytics site identifier. | Recreate in the destination analytics account or remove the script. |

## Active Versus Dormant Dependencies

The live planner currently needs only a Node runtime and `DATABASE_URL` for its core planning capabilities. OAuth, storage, maps, Forge APIs, and analytics are inherited template integrations or platform variables. They are not used by the current budgeting or timeline workflows, although the OAuth and storage routes are still registered by the template server.

> A migration should either configure every retained template service or deliberately remove inactive template modules. Carrying unused credential paths into a new environment increases operational complexity and attack surface.

## Database URL Format

Use a MySQL-compatible URL, for example:

```text
mysql://APPLICATION_USER:URL_ENCODED_PASSWORD@DATABASE_HOST:3306/DATABASE_NAME
```

Use TLS settings required by the selected provider. Do not use the root database account for the application. For production, the application identity should have only the permissions needed to read and update the planner schema; a separate migration identity can hold DDL rights.

## Local Setup Checklist

1. Install Node.js 22.x and pnpm 10.x.
2. Copy `config/environment.template` to `.env`.
3. Create a local MySQL database and set `DATABASE_URL`.
4. Run `pnpm install --frozen-lockfile`.
5. Run `pnpm drizzle-kit migrate` to apply committed migrations.
6. Run `pnpm dev`.
7. Visit the server URL; the first planner read seeds defaults if tables are empty.

## Configuration Ownership Register

During transfer, record the owner, recovery email, billing contact, MFA method, renewal date, and export procedure for the GitHub organization, database provider, hosting provider, DNS registrar, analytics provider, and any identity provider. The application itself cannot recover ownership of those external accounts.
