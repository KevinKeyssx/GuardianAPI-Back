/*
  Warnings:

  - You are about to drop the column `lastUsedAt` on the `PwdAdmin` table. All the data in the column will be lost.
  - You are about to drop the column `mustChange` on the `PwdAdmin` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `PwdAdmin` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PwdAdmin_userId_password_key";

-- AlterTable
ALTER TABLE "PwdAdmin" DROP COLUMN "lastUsedAt",
DROP COLUMN "mustChange",
ADD COLUMN     "alertDay" INTEGER,
ADD COLUMN     "howOften" INTEGER,
ADD COLUMN     "isGuardian" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "willExpireAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "recordId" TEXT,
    "userId" TEXT,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
