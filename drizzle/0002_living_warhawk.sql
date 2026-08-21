CREATE TABLE `planner_timeline_events` (
	`id` varchar(64) NOT NULL,
	`eventTime` varchar(5) NOT NULL,
	`title` varchar(128) NOT NULL,
	`notes` text NOT NULL,
	`sortOrder` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `planner_timeline_events_id` PRIMARY KEY(`id`)
);
