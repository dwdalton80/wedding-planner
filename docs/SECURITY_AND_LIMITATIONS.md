# Security, Assumptions, and Known Limitations

## Current Security Posture

The current deployment is designed as a shared private-link planner without a login screen. The active planner tRPC procedures are public. Anyone who can reach the deployed planner URL can read and modify the shared plan.

| Area | Current state | Recommended action for a new owner |
|---|---|---|
| Access control | No active authorization for planner operations. | Add authentication and an allowlist before treating the app as confidential. |
| Data isolation | One singleton workspace (`planner_settings.id = 1`). | Add workspace/user ownership columns and protected procedures for multi-couple use. |
| Secrets | Platform-injected values are not committed; `.env` is ignored. | Recreate all secrets in the destination secret manager; never copy from chat or Git history. |
| Database | Database access is server-side through `DATABASE_URL`. | Use TLS, a least-privilege application account, backups, and a separate migration account. |
| Transport | Current managed deployment is HTTPS. | Enforce HTTPS, secure headers, and a canonical domain in the destination host. |
| Audit history | No change history, soft deletes, or actor tracking. | Add audit records and version history if accountability is required. |

## Public Repository Warning

The selected GitHub repository is currently public. Source defaults include wedding planning content such as names, venue, date, and budget assumptions. Review repository visibility and any committed product content before a public push. Never commit production database dumps, real credentials, session tokens, or exported analytics data.

## Known Limitations and Technical Debt

| Item | Why it matters | Practical next step |
|---|---|---|
| Shared-link writes are public | The link is not a security boundary. | Add OAuth, magic-link access, or password/allowlist protection. |
| Singleton data model | The product supports one shared plan only. | Introduce `workspace` and membership tables, then scope all queries by workspace ID. |
| Timeline ordering is two updates | Simultaneous reorder requests can race. | Wrap swaps in a database transaction and consider optimistic versioning. |
| No transaction history | Accidental edits cannot be audited or restored individually. | Add an append-only change log or revision snapshots. |
| No export/import UI | A developer is needed for operational data transfer. | Add CSV/JSON export and validated import controls. |
| Template OAuth/storage code remains | Inactive platform coupling increases maintenance surface. | Configure it fully or remove unused routes, client hooks, dependencies, and user table. |
| Single page component is large | `Home.tsx` owns most dashboard composition and interactions. | Split feature panels into `client/src/components/planner/` modules. |
| Limited input semantics | Financial data has no vendor, due date, payment method, or attachment metadata. | Extend data model based on ownership needs rather than overloading notes. |
| No automated end-to-end suite | Route contracts and pure logic are tested, but user flows are not. | Add Playwright or equivalent browser coverage before major expansion. |

## Security Baseline for a Production Migration

1. Put the GitHub repository in the intended visibility state before pushing sensitive product content.
2. Use a dedicated database account with TLS and least-privilege grants.
3. Add application authentication before adding addresses, contracts, payment details, or personal contact information.
4. Use a secret manager for all environment values and rotate credentials during owner transfer.
5. Enable host access logs, database backups, availability monitoring, and dependency-alerting.
6. Add a data-retention and deletion policy if the application moves beyond a personal planning tool.
