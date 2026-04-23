-- CreateTable
CREATE TABLE "DamageLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fleetUnitId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "damageType" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "photoUrls" TEXT NOT NULL,
    "videoUrls" TEXT,
    "reportedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inspectedDate" DATETIME,
    "repairDate" DATETIME,
    "repairCost" INTEGER,
    "repairNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'reported',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DamageLog_fleetUnitId_fkey" FOREIGN KEY ("fleetUnitId") REFERENCES "FleetUnit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DamageLog_fleetUnitId_idx" ON "DamageLog"("fleetUnitId");

-- CreateIndex
CREATE INDEX "DamageLog_status_idx" ON "DamageLog"("status");

-- CreateIndex
CREATE INDEX "DamageLog_severity_idx" ON "DamageLog"("severity");

-- CreateIndex
CREATE INDEX "DamageLog_reportedDate_idx" ON "DamageLog"("reportedDate");
