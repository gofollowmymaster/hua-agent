/*
  Warnings:

  - You are about to drop the `CompanyNames` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HeaderTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subapp` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerifyMCodeAndDCode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Version` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `CompanyNames` DROP FOREIGN KEY `CompanyNames_MId_fkey`;

-- DropForeignKey
ALTER TABLE `HeaderTags` DROP FOREIGN KEY `HeaderTags_versionId_fkey`;

-- DropForeignKey
ALTER TABLE `Version` DROP FOREIGN KEY `Version_subappId_fkey`;

-- DropTable
DROP TABLE `CompanyNames`;

-- DropTable
DROP TABLE `HeaderTags`;

-- DropTable
DROP TABLE `Subapp`;

-- DropTable
DROP TABLE `VerifyMCodeAndDCode`;

-- DropTable
DROP TABLE `Version`;
