/*
  Warnings:

  - You are about to drop the `CompanyNames` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `CompanyNames` DROP FOREIGN KEY `CompanyNames_MId_fkey`;

-- DropTable
DROP TABLE `CompanyNames`;
