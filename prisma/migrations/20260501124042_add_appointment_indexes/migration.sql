-- CreateIndex
CREATE INDEX "appointments_businessId_date_idx" ON "appointments"("businessId", "date");

-- CreateIndex
CREATE INDEX "appointments_businessId_date_status_idx" ON "appointments"("businessId", "date", "status");
