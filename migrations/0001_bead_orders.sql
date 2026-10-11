CREATE TABLE `bead_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`session` text NOT NULL,
	`created_at` text NOT NULL,
	`status` text NOT NULL,
	`details` text NOT NULL,
	`total` integer NOT NULL,
	`paypal_id` text,
	`capture_id` text
);

CREATE UNIQUE INDEX `bead_orders_paypal_id_unique` ON `bead_orders` (`paypal_id`);
CREATE INDEX bead_orders_session_created ON bead_orders(session, created_at);
