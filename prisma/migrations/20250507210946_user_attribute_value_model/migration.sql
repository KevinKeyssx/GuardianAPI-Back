/*
  Warnings:

  - You are about to drop the column `value` on the `UserAttribute` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserAttribute" DROP COLUMN "value";

-- CreateTable
CREATE TABLE "UserAttributeValue" (
    "id" TEXT NOT NULL,
    "value" JSONB,
    "userAttributeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserAttributeValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserAttributeValue_userAttributeId_userId_idx" ON "UserAttributeValue"("userAttributeId", "userId");

-- AddForeignKey
ALTER TABLE "UserAttributeValue" ADD CONSTRAINT "UserAttributeValue_userAttributeId_fkey" FOREIGN KEY ("userAttributeId") REFERENCES "UserAttribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAttributeValue" ADD CONSTRAINT "UserAttributeValue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
