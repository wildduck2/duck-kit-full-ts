ALTER TABLE "access_tokens" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."token_status";--> statement-breakpoint
CREATE TYPE "public"."token_status" AS ENUM('active', 'expired', 'revoked');--> statement-breakpoint
ALTER TABLE "access_tokens" ALTER COLUMN "status" SET DATA TYPE "public"."token_status" USING "status"::"public"."token_status";