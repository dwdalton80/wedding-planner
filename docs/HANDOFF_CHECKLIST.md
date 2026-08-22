# Technical Handoff Checklist

Use this checklist during acquisition, ownership transfer, or migration. A check is not complete until the new owner has independently verified it.

## Source and Documentation

- [ ] New owner has administrator access to the GitHub repository and branch-protection settings.
- [ ] Repository visibility has been reviewed against the presence of wedding-related starter content.
- [ ] New owner has read `README.md` and every document in `docs/`.
- [ ] New owner can run `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm check`, and `pnpm build` from a clean clone.
- [ ] GitHub Actions CI has run successfully on the destination default branch.

## Secrets and External Accounts

- [ ] Database provider ownership, billing, backup retention, and recovery access are transferred or recreated.
- [ ] Hosting provider ownership, billing, and deployment environment variables are transferred or recreated.
- [ ] DNS registrar and authoritative DNS ownership are transferred if retaining a custom domain.
- [ ] All application/database/platform secrets have been rotated for the new owner.
- [ ] Analytics, OAuth, Forge, and storage accounts are either transferred, recreated, or explicitly decommissioned.

## Data and Deployment

- [ ] A current database export has been created, encrypted, and restored successfully in a destination test environment.
- [ ] Drizzle migrations have been applied in the destination environment.
- [ ] Planner settings, budget lines, and timeline event counts match the expected source backup.
- [ ] Production deployment is HTTPS, connected to the intended database, and passed browser smoke tests.
- [ ] Domain cutover and rollback steps are documented and tested.

## Security and Product Acceptance

- [ ] The owner understands that the current shared-link planner has no access-control enforcement.
- [ ] The chosen authorization strategy is documented before confidential data is added.
- [ ] The owner accepts known limitations or has funded a remediation roadmap.
- [ ] The prior environment is decommissioned only after final acceptance and a verified backup.
