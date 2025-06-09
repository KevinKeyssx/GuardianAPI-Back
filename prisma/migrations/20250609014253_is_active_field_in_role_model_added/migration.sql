/*
  Warnings:

  - You are about to drop the column `isActive` on the `UserRole` table. All the data in the column will be lost.
  - Made the column `userId` on table `Permission` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Permission_name_idx";

-- DropIndex
DROP INDEX "UserRole_userId_roleId_isActive_idx";

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "UserRole" DROP COLUMN "isActive";

-- CreateIndex
CREATE INDEX "Permission_name_userId_isActive_idx" ON "Permission"("name", "userId", "isActive");

-- CreateIndex
CREATE INDEX "UserRole_userId_roleId_idx" ON "UserRole"("userId", "roleId");
