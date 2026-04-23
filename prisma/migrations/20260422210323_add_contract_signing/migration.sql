-- CreateTable
CREATE TABLE "ContractSigning" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingReference" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "contractHash" TEXT NOT NULL,
    "signedAt" DATETIME NOT NULL,
    "idDocumentPath" TEXT NOT NULL,
    "passportDocumentPath" TEXT NOT NULL,
    "signaturePath" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ContractSigning_bookingReference_key" ON "ContractSigning"("bookingReference");

-- CreateIndex
CREATE INDEX "ContractSigning_bookingReference_idx" ON "ContractSigning"("bookingReference");

-- CreateIndex
CREATE INDEX "ContractSigning_customerEmail_idx" ON "ContractSigning"("customerEmail");

-- CreateIndex
CREATE INDEX "ContractSigning_signedAt_idx" ON "ContractSigning"("signedAt");

-- CreateIndex
CREATE INDEX "ContractSigning_status_idx" ON "ContractSigning"("status");
