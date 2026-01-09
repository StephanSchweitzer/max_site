/*
  Warnings:

  - Made the column `firstName` on table `Person` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `Person` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phoneNumber` on table `Person` required. This step will fail if there are existing NULL values in that column.
  - Made the column `funFact` on table `Person` required. This step will fail if there are existing NULL values in that column.
  - Made the column `biography` on table `Person` required. This step will fail if there are existing NULL values in that column.
  - Made the column `previousWorkExperience` on table `Person` required. This step will fail if there are existing NULL values in that column.
  - Made the column `recruitNumber` on table `Person` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Person" ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL,
ALTER COLUMN "phoneNumber" SET NOT NULL,
ALTER COLUMN "funFact" SET NOT NULL,
ALTER COLUMN "biography" SET NOT NULL,
ALTER COLUMN "previousWorkExperience" SET NOT NULL,
ALTER COLUMN "recruitNumber" SET NOT NULL;
