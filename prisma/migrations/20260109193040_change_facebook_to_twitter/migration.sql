/*
  Warnings:

  - You are about to drop the column `facebook` on the `Person` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Person" DROP COLUMN "facebook",
ADD COLUMN     "twitter" TEXT;
