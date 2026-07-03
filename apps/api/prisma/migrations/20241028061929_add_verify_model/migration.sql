-- CreateTable
CREATE TABLE `VerifyMCodeAndDCode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `MId` VARCHAR(191) NOT NULL,
    `DId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `VerifyMCodeAndDCode_MId_key`(`MId`),
    UNIQUE INDEX `VerifyMCodeAndDCode_DId_key`(`DId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CompanyNames` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `MId` VARCHAR(191) NOT NULL,
    `CompanyName` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `CompanyNames_MId_key`(`MId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CompanyNames` ADD CONSTRAINT `CompanyNames_MId_fkey` FOREIGN KEY (`MId`) REFERENCES `VerifyMCodeAndDCode`(`MId`) ON DELETE RESTRICT ON UPDATE CASCADE;
