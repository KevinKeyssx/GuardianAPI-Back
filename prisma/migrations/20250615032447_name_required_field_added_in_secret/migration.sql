/*
  Warnings:

  - Made the column `name` on table `Secret` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Secret" ALTER COLUMN "name" SET NOT NULL;
