CREATE TABLE `planner_items` (
	`id` varchar(64) NOT NULL,
	`tracker` enum('wedding','honeymoon') NOT NULL,
	`majorCategory` varchar(128) NOT NULL,
	`label` varchar(128) NOT NULL,
	`plannedCents` int NOT NULL,
	`spentCents` int NOT NULL,
	`sortOrder` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `planner_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `planner_settings` (
	`id` int NOT NULL,
	`weddingDate` varchar(10) NOT NULL,
	`guestCount` int NOT NULL,
	`weddingBudgetCents` int NOT NULL,
	`honeymoonBudgetCents` int NOT NULL,
	`venueCostPaidCents` int NOT NULL,
	`venueName` varchar(128) NOT NULL,
	`venueCapacity` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `planner_settings_id` PRIMARY KEY(`id`)
);
