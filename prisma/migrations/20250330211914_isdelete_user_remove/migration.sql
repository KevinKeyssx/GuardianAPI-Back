/*
  Warnings:

  - You are about to drop the column `isDeleted` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_isActive_isDeleted_apiUserId_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isDeleted";

-- CreateIndex
CREATE INDEX "User_isActive_apiUserId_email_idx" ON "User"("isActive", "apiUserId", "email");
