-- AlterTable
ALTER TABLE "FleetUnit" ADD COLUMN "documentsLastChecked" DATETIME;
ALTER TABLE "FleetUnit" ADD COLUMN "insuranceExpiry" DATETIME;
ALTER TABLE "FleetUnit" ADD COLUMN "ltRegistrationExpiry" DATETIME;
ALTER TABLE "FleetUnit" ADD COLUMN "orCrDocumentUrl" TEXT;
ALTER TABLE "FleetUnit" ADD COLUMN "orCrExpiry" DATETIME;

-- CreateIndex
CREATE INDEX "FleetUnit_orCrExpiry_idx" ON "FleetUnit"("orCrExpiry");

-- CreateIndex
CREATE INDEX "FleetUnit_ltRegistrationExpiry_idx" ON "FleetUnit"("ltRegistrationExpiry");

-- CreateIndex
CREATE INDEX "FleetUnit_insuranceExpiry_idx" ON "FleetUnit"("insuranceExpiry");
