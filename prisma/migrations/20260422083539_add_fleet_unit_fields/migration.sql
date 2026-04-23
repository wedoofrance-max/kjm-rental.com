/*
  Warnings:

  - Added the required column `licensePlate` to the `FleetUnit` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FleetUnit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "currentKilometers" INTEGER NOT NULL DEFAULT 0,
    "lastMaintenanceDate" DATETIME,
    "maintenanceKilometers" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FleetUnit_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FleetUnit" ("createdAt", "id", "status", "unitNumber", "licensePlate", "updatedAt", "vehicleId") SELECT "createdAt", "id", "status", "unitNumber", 'PL-' || "unitNumber", "updatedAt", "vehicleId" FROM "FleetUnit";
DROP TABLE "FleetUnit";
ALTER TABLE "new_FleetUnit" RENAME TO "FleetUnit";
CREATE INDEX "FleetUnit_vehicleId_idx" ON "FleetUnit"("vehicleId");
CREATE INDEX "FleetUnit_status_idx" ON "FleetUnit"("status");
CREATE UNIQUE INDEX "FleetUnit_vehicleId_unitNumber_key" ON "FleetUnit"("vehicleId", "unitNumber");
CREATE UNIQUE INDEX "FleetUnit_licensePlate_key" ON "FleetUnit"("licensePlate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
