CREATE TABLE `favorites` (
	`user_email` text NOT NULL,
	`item_type` text NOT NULL,
	`item_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`user_email`, `item_type`, `item_id`)
);
--> statement-breakpoint
CREATE TABLE `saved_trips` (
	`id` text PRIMARY KEY NOT NULL,
	`user_email` text NOT NULL,
	`title` text NOT NULL,
	`destination` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
