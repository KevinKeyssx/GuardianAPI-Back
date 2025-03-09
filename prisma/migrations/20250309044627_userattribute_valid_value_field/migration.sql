/*
  Warnings:

  - The `value` column on the `UserAttribute` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `type` to the `UserAttribute` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttributeType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'DECIMAL', 'LIST', 'JSON', 'DATETIME', 'UUID');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "UserAttribute" ADD COLUMN     "defaultValue" JSONB,
ADD COLUMN     "max" DOUBLE PRECISION,
ADD COLUMN     "maxDate" TIMESTAMP(3),
ADD COLUMN     "maxLength" INTEGER,
ADD COLUMN     "min" DOUBLE PRECISION,
ADD COLUMN     "minDate" TIMESTAMP(3),
ADD COLUMN     "minLength" INTEGER,
ADD COLUMN     "pattern" TEXT,
ADD COLUMN     "required" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "AttributeType" NOT NULL,
DROP COLUMN "value",
ADD COLUMN     "value" JSONB;
