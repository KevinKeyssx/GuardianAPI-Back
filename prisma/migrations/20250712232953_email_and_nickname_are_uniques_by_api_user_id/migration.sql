/*
  Warnings:

  - A unique constraint covering the columns `[email,apiUserId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nickname,apiUserId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_email_nickname_apiUserId_key";

-- CreateIndex
CREATE UNIQUE INDEX "User_email_apiUserId_key" ON "User"("email", "apiUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_nickname_apiUserId_key" ON "User"("nickname", "apiUserId");
