/*
  Warnings:

  - Made the column `DId` on table `VerifyMCodeAndDCode` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `VerifyMCodeAndDCode` MODIFY `DId` VARCHAR(191) NOT NULL;
