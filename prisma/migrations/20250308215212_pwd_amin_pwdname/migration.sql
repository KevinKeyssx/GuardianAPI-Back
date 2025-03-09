/*
  Warnings:

  - You are about to drop the column `passwordHash` on the `PwdAdmin` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,password]` on the table `PwdAdmin` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `PwdAdmin` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PwdAdmin_userId_passwordHash_key";

-- AlterTable
ALTER TABLE "PwdAdmin" DROP COLUMN "passwordHash",
ADD COLUMN     "password" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PwdAdmin_userId_password_key" ON "PwdAdmin"("userId", "password");
