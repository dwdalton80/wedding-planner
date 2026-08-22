# Contributing

## Before You Begin

Use Node.js 22.x and pnpm 10.x. Copy `config/environment.template` to `.env`, configure `DATABASE_URL`, apply migrations, and confirm the test suite passes before starting feature work.

## Pull Request Expectations

Every contribution should explain the user-facing outcome, list data-model or environment changes, include tests for changed behavior, and update the relevant handoff documentation. Use a focused branch and avoid bundling unrelated refactors with schema changes.

## Verification

```bash
pnpm test
pnpm check
pnpm build
```

For UI changes, verify both desktop and mobile layouts. For schema changes, commit the generated migration after reviewing it and never commit local `.env` files or database exports.

## Code Review Focus

Reviewers should confirm input validation, money-in-cents handling, database migration safety, query invalidation after mutations, responsive behavior, access-control impact, and documentation completeness.
