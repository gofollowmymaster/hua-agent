/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `HeaderTags` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `HeaderTags_key_key` ON `HeaderTags`(`key`);
