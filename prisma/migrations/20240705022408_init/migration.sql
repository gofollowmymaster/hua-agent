-- CreateTable
CREATE TABLE `Subapp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subappName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Version` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `versionName` VARCHAR(191) NOT NULL,
    `versionEntry` VARCHAR(191) NOT NULL,
    `subappId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Version` ADD CONSTRAINT `Version_subappId_fkey` FOREIGN KEY (`subappId`) REFERENCES `Subapp`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
