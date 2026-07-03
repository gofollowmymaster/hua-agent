/*
  Warnings:

  - The primary key for the `AlertMessage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `AlertMessage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `AlertMessageUser` DROP FOREIGN KEY `AlertMessageUser_messageId_fkey`;

-- AlterTable
ALTER TABLE `AlertMessage` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`fMessageId`);

-- AlterTable
ALTER TABLE `AlertMessageUser` MODIFY `messageId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `AlertMessageUser` ADD CONSTRAINT `AlertMessageUser_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `AlertMessage`(`fMessageId`) ON DELETE RESTRICT ON UPDATE CASCADE;
