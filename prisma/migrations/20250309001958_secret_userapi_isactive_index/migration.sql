-- DropIndex
DROP INDEX "Secret_apiUserId_isActive_key";

-- CreateIndex
CREATE INDEX "Secret_apiUserId_isActive_idx" ON "Secret"("apiUserId", "isActive");
