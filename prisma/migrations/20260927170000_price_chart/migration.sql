-- AlterTable
ALTER TABLE "share_holdings" ADD COLUMN "downPaymentBDT" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_membership_plans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "minUnits" INTEGER NOT NULL,
    "maxUnits" INTEGER,
    "unitPriceBDT" INTEGER NOT NULL,
    "fullPriceBDT" INTEGER NOT NULL DEFAULT 0,
    "downPaymentBDT" INTEGER NOT NULL DEFAULT 0,
    "installmentCount" INTEGER NOT NULL DEFAULT 12,
    "freeStayNights" INTEGER NOT NULL,
    "accentColor" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_membership_plans" ("accentColor", "createdAt", "featured", "freeStayNights", "id", "maxUnits", "minUnits", "name", "slug", "sortOrder", "subtitle", "unitPriceBDT", "updatedAt") SELECT "accentColor", "createdAt", "featured", "freeStayNights", "id", "maxUnits", "minUnits", "name", "slug", "sortOrder", "subtitle", "unitPriceBDT", "updatedAt" FROM "membership_plans";
DROP TABLE "membership_plans";
ALTER TABLE "new_membership_plans" RENAME TO "membership_plans";
CREATE UNIQUE INDEX "membership_plans_slug_key" ON "membership_plans"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

