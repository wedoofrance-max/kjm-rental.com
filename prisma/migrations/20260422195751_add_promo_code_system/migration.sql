-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "minNights" INTEGER,
    "maxUsage" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "fleetUnitId" TEXT,
    "pickupDate" DATETIME NOT NULL,
    "returnDate" DATETIME NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "pickupAddress" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalPrice" INTEGER NOT NULL,
    "depositRequired" INTEGER NOT NULL DEFAULT 2500,
    "depositPaid" BOOLEAN NOT NULL DEFAULT false,
    "promoCodeId" TEXT,
    "discountType" TEXT,
    "autoDiscount" INTEGER NOT NULL DEFAULT 0,
    "promoDiscount" INTEGER NOT NULL DEFAULT 0,
    "finalPrice" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_fleetUnitId_fkey" FOREIGN KEY ("fleetUnitId") REFERENCES "FleetUnit" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("createdAt", "customerId", "depositPaid", "depositRequired", "fleetUnitId", "id", "pickupAddress", "pickupDate", "pickupLocation", "reference", "returnDate", "status", "totalPrice", "updatedAt", "vehicleId") SELECT "createdAt", "customerId", "depositPaid", "depositRequired", "fleetUnitId", "id", "pickupAddress", "pickupDate", "pickupLocation", "reference", "returnDate", "status", "totalPrice", "updatedAt", "vehicleId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_reference_key" ON "Booking"("reference");
CREATE INDEX "Booking_customerId_idx" ON "Booking"("customerId");
CREATE INDEX "Booking_vehicleId_idx" ON "Booking"("vehicleId");
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
CREATE INDEX "Booking_pickupDate_idx" ON "Booking"("pickupDate");
CREATE INDEX "Booking_promoCodeId_idx" ON "Booking"("promoCodeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "PromoCode_code_idx" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "PromoCode_expiresAt_idx" ON "PromoCode"("expiresAt");

-- CreateIndex
CREATE INDEX "PromoCode_isActive_idx" ON "PromoCode"("isActive");
