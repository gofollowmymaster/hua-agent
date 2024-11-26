/*
  Warnings:

  - Made the column `MId` on table `VerifyMCodeAndDCode` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `VerifyMCodeAndDCode` ADD COLUMN `MIdStatus` ENUM('Enable', 'Disable') NOT NULL DEFAULT 'Enable',
    MODIFY `MId` VARCHAR(191) NOT NULL;
