/*
  Warnings:

  - You are about to drop the column `reqKey` on the `Version` table. All the data in the column will be lost.
  - You are about to drop the column `reqVal` on the `Version` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Version` DROP COLUMN `reqKey`,
    DROP COLUMN `reqVal`;

-- CreateTable
CREATE TABLE `HeaderTags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `versionId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HeaderTags` ADD CONSTRAINT `HeaderTags_versionId_fkey` FOREIGN KEY (`versionId`) REFERENCES `Version`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
