CREATE TABLE IF NOT EXISTS "accounts" (
	"id" char(64) PRIMARY KEY NOT NULL,
	"balance" integer NOT NULL,
	"clock" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transfers" (
	"offset" integer NOT NULL,
	"from" char(64) NOT NULL,
	"to" char(64) NOT NULL,
	"amount" integer NOT NULL,
	CONSTRAINT "transfers_from_offset_pk" PRIMARY KEY("from","offset")
);
