/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `HeaderTags` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `HeaderTags_id_key` ON `HeaderTags`(`id`);
