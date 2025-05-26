/*
  Warnings:

  - A unique constraint covering the columns `[userAttributeId,userId]` on the table `UserAttributeValue` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserAttributeValue_userAttributeId_userId_key" ON "UserAttributeValue"("userAttributeId", "userId");
