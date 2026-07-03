/*
  Warnings:

  - You are about to drop the column `userId` on the `AlertMessageUser` table. All the data in the column will be lost.
  - Added the required column `fUserId` to the `AlertMessageUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `AlertMessage_fMessageId_key` ON `AlertMessage`;

-- AlterTable
ALTER TABLE `AlertMessageUser` DROP COLUMN `userId`,
    ADD COLUMN `fUserId` VARCHAR(191) NOT NULL;
