-- DropIndex (slug is no longer globally unique)
DROP INDEX IF EXISTS "pages_slug_key";

-- AlterTable: add nullable theme_id, backfill from active site theme, then enforce NOT NULL
ALTER TABLE "pages" ADD COLUMN "theme_id" UUID;

UPDATE "pages"
SET "theme_id" = (SELECT "active_theme_id" FROM "site_settings" LIMIT 1)
WHERE "theme_id" IS NULL;

ALTER TABLE "pages" ALTER COLUMN "theme_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "pages"
  ADD CONSTRAINT "pages_theme_id_fkey"
  FOREIGN KEY ("theme_id") REFERENCES "themes"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex (composite uniqueness for slug per theme)
CREATE UNIQUE INDEX "pages_theme_id_slug_key" ON "pages"("theme_id", "slug");

-- CreateIndex (helps the public/admin "list pages of active theme" queries)
CREATE INDEX "pages_theme_id_status_idx" ON "pages"("theme_id", "status");
