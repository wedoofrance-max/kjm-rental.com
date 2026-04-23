-- CreateTable
CREATE TABLE "DocumentExpiryAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fleetUnitId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "expiryDate" DATETIME NOT NULL,
    "daysUntilExpiry" INTEGER NOT NULL,
    "firstAlertSent" DATETIME,
    "alertCount" INTEGER NOT NULL DEFAULT 0,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DocumentExpiryAlert_fleetUnitId_fkey" FOREIGN KEY ("fleetUnitId") REFERENCES "FleetUnit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VehiclePageView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "viewType" TEXT NOT NULL,
    "ipHash" TEXT,
    "referrer" TEXT,
    "viewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ActiveViewer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "viewType" TEXT NOT NULL,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "DocumentExpiryAlert_fleetUnitId_idx" ON "DocumentExpiryAlert"("fleetUnitId");

-- CreateIndex
CREATE INDEX "DocumentExpiryAlert_documentType_idx" ON "DocumentExpiryAlert"("documentType");

-- CreateIndex
CREATE INDEX "DocumentExpiryAlert_daysUntilExpiry_idx" ON "DocumentExpiryAlert"("daysUntilExpiry");

-- CreateIndex
CREATE INDEX "DocumentExpiryAlert_dismissed_idx" ON "DocumentExpiryAlert"("dismissed");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentExpiryAlert_fleetUnitId_documentType_key" ON "DocumentExpiryAlert"("fleetUnitId", "documentType");

-- CreateIndex
CREATE INDEX "VehiclePageView_vehicleId_idx" ON "VehiclePageView"("vehicleId");

-- CreateIndex
CREATE INDEX "VehiclePageView_viewedAt_idx" ON "VehiclePageView"("viewedAt");

-- CreateIndex
CREATE INDEX "VehiclePageView_viewType_idx" ON "VehiclePageView"("viewType");

-- CreateIndex
CREATE INDEX "ActiveViewer_vehicleId_idx" ON "ActiveViewer"("vehicleId");

-- CreateIndex
CREATE INDEX "ActiveViewer_viewType_idx" ON "ActiveViewer"("viewType");

-- CreateIndex
CREATE INDEX "ActiveViewer_lastSeenAt_idx" ON "ActiveViewer"("lastSeenAt");

-- CreateIndex
CREATE INDEX "ActiveViewer_expiresAt_idx" ON "ActiveViewer"("expiresAt");
