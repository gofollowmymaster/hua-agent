/*
  Warnings:

  - A unique constraint covering the columns `[messageId]` on the table `AlertMessage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `AlertMessage_messageId_key` ON `AlertMessage`(`messageId`);
