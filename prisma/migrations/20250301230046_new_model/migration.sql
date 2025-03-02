/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `permissionId` on the `UserAttribute` table. All the data in the column will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserRoles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,name]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nickname]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,key]` on the table `UserAttribute` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserAttribute" DROP CONSTRAINT "UserAttribute_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "_UserRoles" DROP CONSTRAINT "_UserRoles_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserRoles" DROP CONSTRAINT "_UserRoles_B_fkey";

-- DropIndex
DROP INDEX "UserAttribute_userId_permissionId_idx";

-- DropIndex
DROP INDEX "UserAttribute_userId_permissionId_key_key";

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "apiUserId" TEXT,
ADD COLUMN     "appleId" TEXT,
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "birthdate" TIMESTAMP(3),
ADD COLUMN     "facebookId" TEXT,
ADD COLUMN     "githubId" TEXT,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "microsoftId" TEXT,
ADD COLUMN     "nickname" TEXT,
ADD COLUMN     "otherId" TEXT;

-- AlterTable
ALTER TABLE "UserAttribute" DROP COLUMN "permissionId",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "Permission";

-- DropTable
DROP TABLE "_UserRoles";

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Secret" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "apiUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Secret_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserRole_userId_roleId_isActive_idx" ON "UserRole"("userId", "roleId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Secret_secret_key" ON "Secret"("secret");

-- CreateIndex
CREATE INDEX "Role_userId_idx" ON "Role"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_userId_name_key" ON "Role"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "User_nickname_key" ON "User"("nickname");

-- CreateIndex
CREATE INDEX "User_isActive_isDeleted_idx" ON "User"("isActive", "isDeleted");

-- CreateIndex
CREATE INDEX "UserAttribute_userId_idx" ON "UserAttribute"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAttribute_userId_key_key" ON "UserAttribute"("userId", "key");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_apiUserId_fkey" FOREIGN KEY ("apiUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Secret" ADD CONSTRAINT "Secret_apiUserId_fkey" FOREIGN KEY ("apiUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
