-- Rename state to emirate (preserves existing data — Prisma's default plan
-- would drop+recreate the column, losing the 1 existing row)
ALTER TABLE "public"."Address" RENAME COLUMN "state" TO "emirate";

-- Add optional PO Box / Makani number field (UAE addressing convention)
ALTER TABLE "public"."Address" ADD COLUMN "poBox" TEXT;

-- zipCode is no longer required — UAE addresses typically don't have postal codes
ALTER TABLE "public"."Address" ALTER COLUMN "zipCode" DROP NOT NULL;

-- Default country to UAE for new rows
ALTER TABLE "public"."Address" ALTER COLUMN "country" SET DEFAULT 'United Arab Emirates';
