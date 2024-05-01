CREATE TABLE `links` (
	`link` text PRIMARY KEY NOT NULL,
	`staysCount` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stays` (
	`name` text NOT NULL,
	`city` text NOT NULL,
	`parentLink` text,
	`link` text PRIMARY KEY NOT NULL,
	FOREIGN KEY (`parentLink`) REFERENCES `links`(`link`) ON UPDATE no action ON DELETE no action
);
