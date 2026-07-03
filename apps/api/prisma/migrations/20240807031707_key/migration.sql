/*
  Warnings:

  - You are about to drop the column `key` on the `HeaderTags` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `HeaderTags` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reqKey]` on the table `HeaderTags` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reqKey` to the `HeaderTags` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reqValue` to the `HeaderTags` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `HeaderTags_key_key` ON `HeaderTags`;

-- AlterTable
ALTER TABLE `HeaderTags` DROP COLUMN `key`,
    DROP COLUMN `value`,
    ADD COLUMN `reqKey` VARCHAR(191) NOT NULL,
    ADD COLUMN `reqValue` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `HeaderTags_reqKey_key` ON `HeaderTags`(`reqKey`);
