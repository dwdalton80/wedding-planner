# Kyia + Keilen Wedding Planner

Kyia + Keilen Wedding Planner is a shared, browser-based wedding and honeymoon budget planner. It combines persisted wedding inputs, detailed category budgets, guest-cost scenarios, a honeymoon tracker, and an editable wedding-day timeline in one responsive dashboard.

> **Handoff status:** This repository is structured for a developer or future owner to run, maintain, migrate, and extend independently. Read the [handoff documentation](#documentation-index) before transferring infrastructure or production data.

## What Is Included

| Capability | Description |
|---|---|
| Shared planner | A single persisted workspace stores wedding date, guest count, budgets, venue data, and capacity. |
| Wedding budget | Twenty-one editable line items roll up into seven major categories with planned, spent, remaining, and share calculations. |
| Honeymoon budget | Six editable categories include direct, informational deal-search links for Great Value Vacations and Vacation Express. |
| Guest analysis | Five guest-count scenarios and a chart show wedding-only and combined per-person costs. |
| Wedding-day timeline | Starter schedule with create, edit, delete, and move-up/move-down operations. |
| Responsive UI | A burgundy, gold, and sage dashboard with mobile card layouts, Georgia serif headings, a K/K monogram, and wedding countdown. |

## Technology Summary

| Layer | Current implementation |
|---|---|
| Client | React 19, TypeScript, Vite, Tailwind CSS 4, shadcn-style UI primitives, TanStack Query, Recharts |
| API | Express 4 with tRPC 11 and Zod input validation |
| Database | MySQL/TiDB-compatible database accessed through Drizzle ORM and `mysql2` |
| Build | Vite client build plus esbuild server bundle |
| Tests | Vitest unit and route-contract tests |
| Current deployment | Manus managed autoscale runtime; current managed domain: `kyiawedding-babcyca9.manus.space` |

## Important Access Note

The current planner uses a **shared private-link model without a login screen**. The planner procedures are deliberately implemented as public tRPC procedures so a partner can use the same link without OAuth. A non-public deployment URL is not a substitute for authorization. Before storing more sensitive information or moving to a broader audience, implement an authenticated partner allowlist or another explicit access-control model. See [Security and limitations](docs/SECURITY_AND_LIMITATIONS.md).

## Quick Start

### Prerequisites

Use Node.js 22.x, pnpm 10.x, and a MySQL 8+/TiDB-compatible database. A `DATABASE_URL` is required for all database commands and for the app to load a planner.

```bash
cp config/environment.template .env
# Set DATABASE_URL in .env; do not commit it.
pnpm install --frozen-lockfile
pnpm drizzle-kit migrate
pnpm dev
```

The development server selects an available port beginning with `PORT` or `3000`. Open the URL it prints. On first database access, the application seeds the single planner workspace, budget lines, and timeline starter events only when the related table is empty.

## Common Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Run the Express server and Vite development middleware. |
| `pnpm build` | Build the client and production server bundle into `dist/`. |
| `pnpm build:pages` | Build a static GitHub Pages version into `dist/public/`. |
| `pnpm start` | Run the built production server. |
| `pnpm test` | Run all server and shared Vitest tests. |
| `pnpm check` | Run TypeScript without emitting files. |
| `pnpm format` | Format source files with Prettier. |
| `pnpm drizzle-kit generate` | Generate a migration from `drizzle/schema.ts`. |
| `pnpm drizzle-kit migrate` | Apply committed Drizzle migrations to `DATABASE_URL`. |

Do not run schema generation against a production database until the generated SQL has been reviewed. The detailed database workflow is documented in [Maintenance conventions](docs/MAINTENANCE.md).

## GitHub Pages Deployment

The repository includes `.github/workflows/deploy-pages.yml`. Each push to `main` tests, type-checks, builds, and publishes the site to `https://dwdalton80.github.io/wedding-planner/`.

GitHub Pages is static hosting and cannot run this repository's Express API or MySQL database. The Pages build therefore uses browser storage: edits persist on the current browser and device and sync across tabs, but they are not shared between people or devices. The regular `pnpm dev`, `pnpm build`, and `pnpm start` commands continue to use the shared server/database mode.

To enable the first deployment, open the repository's **Settings → Pages**, set **Source** to **GitHub Actions**, and run the **Deploy to GitHub Pages** workflow if it did not start automatically.

## Repository Layout

```text
client/                 React application and UI styling
  src/pages/Home.tsx    Primary planner dashboard and client interactions
  src/components/       Reusable UI components and template infrastructure
server/                 Express, tRPC router, database helpers, and tests
  routers.ts            Public planner API contract
  db.ts                 Seeding and persistence operations
  _core/                Template runtime, OAuth, storage, and Vite plumbing
shared/                 Starter plan data and pure calculation helpers
drizzle/                Drizzle schema snapshots and SQL migrations
docs/                   Architecture, operations, migration, and handoff guides
.github/workflows/      GitHub Actions continuous-integration workflow
```

## Documentation Index

| Document | Use it for |
|---|---|
| [Architecture](docs/ARCHITECTURE.md) | Runtime topology, API/data flows, and component responsibilities. |
| [Data model](docs/DATA_MODEL.md) | Tables, seed behavior, identifiers, and backup scope. |
| [Environment guide](docs/ENVIRONMENT.md) | Required configuration and platform-specific variables. |
| [Operations runbook](docs/OPERATIONS.md) | Build, deploy, monitoring, backup, and recovery practices. |
| [Migration playbook](docs/MIGRATION.md) | Transfer of hosting, data, DNS, source, and ownership. |
| [Security and limitations](docs/SECURITY_AND_LIMITATIONS.md) | Current risk posture, known limitations, and technical debt. |
| [Maintenance guide](docs/MAINTENANCE.md) | Development conventions, testing, and safe schema changes. |
| [Handoff checklist](docs/HANDOFF_CHECKLIST.md) | Acquisition or owner-transfer completion checklist. |
| [Contributing guide](CONTRIBUTING.md) | Local contribution and pull-request expectations. |

## Production Data and Secrets

No production credentials, database dumps, session tokens, or platform keys belong in this repository. Copy `config/environment.template` to a private `.env` file locally or configure equivalent encrypted environment variables in the chosen host. The repository intentionally ignores `.env` files, build output, logs, local database files, and platform artifacts.

## License

This project is released under the [MIT License](LICENSE). Before an acquisition, confirm that the intended license, visual brand assets, and any third-party content align with the transaction terms.
