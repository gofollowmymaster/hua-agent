/*
  Warnings:

  - You are about to drop the `HeaderTags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `HeaderTags` DROP FOREIGN KEY `HeaderTags_versionId_fkey`;

-- DropTable
DROP TABLE `HeaderTags`;
