# Data Model and Data Lifecycle

## Overview

All current planner data is stored in a MySQL/TiDB-compatible database. The application does not store uploaded files or images as part of its active feature set. The operational backup scope is therefore the schema migrations plus the contents of four relational tables.

## Tables

### `planner_settings`

This singleton table represents the shared plan. The application expects the primary key `id = 1`.

| Field | Type | Meaning |
|---|---|---|
| `id` | integer primary key | Singleton workspace identifier; currently always `1`. |
| `weddingDate` | `varchar(10)` | ISO-style wedding date used for countdown display. |
| `guestCount` | integer | Current guest-count assumption. |
| `weddingBudgetCents` | integer | Wedding budget stored in USD cents. |
| `honeymoonBudgetCents` | integer | Honeymoon budget stored in USD cents. |
| `venueCostPaidCents` | integer | Venue payment stored in USD cents. |
| `venueName` | `varchar(128)` | Current code validates this as `Cottonwood Barn`. |
| `venueCapacity` | integer | Venue capacity assumption. |
| `updatedAt` | timestamp | Database-managed last update time. |

### `planner_items`

This table holds both wedding and honeymoon financial line items.

| Field | Type | Meaning |
|---|---|---|
| `id` | `varchar(64)` primary key | Stable starter-line identifier used by API updates and restore logic. |
| `tracker` | enum | `wedding` or `honeymoon`. |
| `majorCategory` | `varchar(128)` | Parent category used for wedding rollups. |
| `label` | `varchar(128)` | User-facing line-item label. |
| `plannedCents` | integer | Planned allocation in USD cents. |
| `spentCents` | integer | Actual amount spent in USD cents. |
| `sortOrder` | integer | Display order within tracker. |
| `updatedAt` | timestamp | Database-managed last update time. |

### `planner_timeline_events`

This table contains editable wedding-day timeline events.

| Field | Type | Meaning |
|---|---|---|
| `id` | `varchar(64)` primary key | Stable event identifier; user-created events use a `timeline-` Nano ID. |
| `eventTime` | `varchar(5)` | Display time in 24-hour `HH:MM` format. |
| `title` | `varchar(128)` | Event title. |
| `notes` | text | Optional event notes. |
| `sortOrder` | integer | Explicit run-of-show order; users can move events independently of time. |
| `updatedAt` | timestamp | Database-managed last update time. |

### `users`

The users table is inherited from the full-stack template. It supports Manus OAuth identity and roles but is not used by the current public-link planner procedures. Retain it only if future authentication features will use it; otherwise, evaluate removing the OAuth/template stack during migration.

## Starter Data and Seeding

`shared/plannerDefaults.ts` defines the starter settings, twenty-one wedding lines, six honeymoon lines, and eight wedding-day events. `getPlannerState()` inserts those defaults only when the associated table is empty.

> **Seed behavior caution:** an empty imported database will receive starter data on first planner read. Import production data before sending traffic to a newly migrated environment, or seed defaults may need to be replaced explicitly.

## Calculations and Units

Money is persisted as integer USD cents. Currency formatting occurs in the client. This prevents floating-point rounding errors in stored values. Category rollups, budget variance, and per-person scenarios are calculated client-side from persisted data. The timeline’s order is determined by `sortOrder`, not by `eventTime`.

## Backup and Restore Scope

For a complete data backup, capture:

1. All committed source and `drizzle/` migrations.
2. A consistent export of `planner_settings`, `planner_items`, and `planner_timeline_events`.
3. The `users` table if OAuth identities or future user history matter.
4. An inventory of external accounts and environment variables; values themselves should remain in a secure secret manager.

Use a transactional database export such as `mysqldump --single-transaction` where supported, test restoration in an isolated database, then verify the expected settings, 27 budget lines, and timeline events before cutover.
