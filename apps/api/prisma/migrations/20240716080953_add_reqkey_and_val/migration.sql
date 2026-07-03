/*
  Warnings:

  - Added the required column `reqKey` to the `Version` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reqVal` to the `Version` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Version` ADD COLUMN `reqKey` VARCHAR(191) NOT NULL,
    ADD COLUMN `reqVal` VARCHAR(191) NOT NULL;
