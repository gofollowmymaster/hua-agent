/*
  Warnings:

  - A unique constraint covering the columns `[versionId]` on the table `HeaderTags` will be added. If there are existing duplicate values, this will fail.
  - Made the column `subappId` on table `Version` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Version` DROP FOREIGN KEY `Version_subappId_fkey`;

-- AlterTable
ALTER TABLE `Version` MODIFY `subappId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `HeaderTags_versionId_key` ON `HeaderTags`(`versionId`);

-- AddForeignKey
ALTER TABLE `Version` ADD CONSTRAINT `Version_subappId_fkey` FOREIGN KEY (`subappId`) REFERENCES `Subapp`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
