/*
  Warnings:

  - A unique constraint covering the columns `[email,nickname,apiUserId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_nickname_key";

-- CreateIndex
CREATE UNIQUE INDEX "User_email_nickname_apiUserId_key" ON "User"("email", "nickname", "apiUserId");
