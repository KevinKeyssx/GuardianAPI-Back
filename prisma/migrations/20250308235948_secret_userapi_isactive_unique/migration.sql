/*
  Warnings:

  - You are about to drop the column `alertDay` on the `PwdAdmin` table. All the data in the column will be lost.
  - You are about to drop the column `changeLastAt` on the `PwdAdmin` table. All the data in the column will be lost.
  - You are about to drop the column `howOften` on the `PwdAdmin` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PwdAdmin` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[apiUserId,isActive]` on the table `Secret` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PwdAdmin_userId_isActive_idx";

-- AlterTable
ALTER TABLE "PwdAdmin" DROP COLUMN "alertDay",
DROP COLUMN "changeLastAt",
DROP COLUMN "howOften",
DROP COLUMN "updatedAt",
ADD COLUMN     "lastUsedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "PwdAdmin_userId_idx" ON "PwdAdmin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Secret_apiUserId_isActive_key" ON "Secret"("apiUserId", "isActive");
