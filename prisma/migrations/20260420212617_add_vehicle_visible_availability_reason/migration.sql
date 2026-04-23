-- AlterTable
ALTER TABLE "Availability" ADD COLUMN "reason" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "engine" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dailyRate" INTEGER NOT NULL,
    "weeklyRate" INTEGER NOT NULL,
    "monthlyRate" INTEGER NOT NULL,
    "topCase" BOOLEAN NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Vehicle" ("brand", "createdAt", "dailyRate", "description", "engine", "id", "model", "monthlyRate", "topCase", "type", "updatedAt", "weeklyRate") SELECT "brand", "createdAt", "dailyRate", "description", "engine", "id", "model", "monthlyRate", "topCase", "type", "updatedAt", "weeklyRate" FROM "Vehicle";
DROP TABLE "Vehicle";
ALTER TABLE "new_Vehicle" RENAME TO "Vehicle";
CREATE INDEX "Vehicle_brand_idx" ON "Vehicle"("brand");
CREATE INDEX "Vehicle_dailyRate_idx" ON "Vehicle"("dailyRate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
