/*
  Warnings:

  - You are about to drop the column `lastUsedAt` on the `PwdAdmin` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `PwdAdmin` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PwdAdmin_userId_idx";

-- DropIndex
DROP INDEX "User_isActive_isDeleted_idx";

-- AlterTable
ALTER TABLE "PwdAdmin" DROP COLUMN "lastUsedAt",
ADD COLUMN     "alertDay" INTEGER,
ADD COLUMN     "changeLastAt" TIMESTAMP(3),
ADD COLUMN     "howOften" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "PwdAdmin_userId_isActive_idx" ON "PwdAdmin"("userId", "isActive");

-- CreateIndex
CREATE INDEX "User_isActive_isDeleted_apiUserId_idx" ON "User"("isActive", "isDeleted", "apiUserId");
