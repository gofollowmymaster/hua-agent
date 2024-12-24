/*
  Warnings:

  - Made the column `createTime` on table `AlertMessage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `AlertMessage` MODIFY `readTime` DATETIME(3) NULL,
    MODIFY `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
