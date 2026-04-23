-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "expiresAt" DATETIME,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RentalReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "period" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "totalBookings" INTEGER NOT NULL,
    "confirmedCount" INTEGER NOT NULL,
    "activeCount" INTEGER NOT NULL,
    "returnedCount" INTEGER NOT NULL,
    "cancelledCount" INTEGER NOT NULL,
    "totalRevenue" INTEGER NOT NULL,
    "depositCollected" INTEGER NOT NULL,
    "finalPayments" INTEGER NOT NULL,
    "averageBooking" INTEGER NOT NULL,
    "paymentBreakdown" JSONB NOT NULL,
    "topVehicles" JSONB NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Document_type_idx" ON "Document"("type");

-- CreateIndex
CREATE INDEX "Document_expiresAt_idx" ON "Document"("expiresAt");

-- CreateIndex
CREATE INDEX "RentalReport_period_idx" ON "RentalReport"("period");

-- CreateIndex
CREATE INDEX "RentalReport_startDate_idx" ON "RentalReport"("startDate");

-- CreateIndex
CREATE INDEX "RentalReport_generatedAt_idx" ON "RentalReport"("generatedAt");
