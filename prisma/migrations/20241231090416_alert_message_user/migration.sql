/*
  Warnings:

  - You are about to drop the column `messageId` on the `AlertMessage` table. All the data in the column will be lost.
  - You are about to drop the column `reactionTime` on the `AlertMessage` table. All the data in the column will be lost.
  - You are about to drop the column `readTime` on the `AlertMessage` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `AlertMessage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fMessageId]` on the table `AlertMessage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fMessageId` to the `AlertMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `AlertMessage_messageId_key` ON `AlertMessage`;

-- AlterTable
ALTER TABLE `AlertMessage` DROP COLUMN `messageId`,
    DROP COLUMN `reactionTime`,
    DROP COLUMN `readTime`,
    DROP COLUMN `userId`,
    ADD COLUMN `fMessageId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `AlertMessageUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `messageId` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `readTime` DATETIME(3) NULL,
    `reactionTime` DATETIME(3) NULL,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `AlertMessage_fMessageId_key` ON `AlertMessage`(`fMessageId`);

-- AddForeignKey
ALTER TABLE `AlertMessageUser` ADD CONSTRAINT `AlertMessageUser_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `AlertMessage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
