/*
  Warnings:

  - You are about to drop the column `appleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `facebookId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `githubId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `microsoftId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otherId` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PlanName" AS ENUM ('FREE', 'BASIC', 'PREMIUM');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('FIRST_TIME', 'PROMOTION', 'CHRISTMAS', 'NEW_YEAR', 'HALLOWEEN', 'PARTIES', 'OTHER');

-- DropIndex
DROP INDEX "Role_userId_idx";

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Secret" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "willExpireAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "appleId",
DROP COLUMN "facebookId",
DROP COLUMN "githubId",
DROP COLUMN "googleId",
DROP COLUMN "microsoftId",
DROP COLUMN "otherId",
ADD COLUMN     "planId" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserAttribute" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserRole" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" "PlanName" NOT NULL,
    "maxUsers" INTEGER NOT NULL,
    "maxRoles" INTEGER NOT NULL,
    "maxAttributes" INTEGER NOT NULL,
    "monthlyPrice" DOUBLE PRECISION NOT NULL,
    "yearlyPrice" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION DEFAULT 0,
    "discountType" "DiscountType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Role_userId_name_idx" ON "Role"("userId", "name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
