-- CreateTable
CREATE TABLE `HeaderTags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `versionId` INTEGER NOT NULL,
    `tagKey` VARCHAR(191) NOT NULL,
    `tagValue` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HeaderTags` ADD CONSTRAINT `HeaderTags_versionId_fkey` FOREIGN KEY (`versionId`) REFERENCES `Version`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
