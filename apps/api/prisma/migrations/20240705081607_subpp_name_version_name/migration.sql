/*
  Warnings:

  - A unique constraint covering the columns `[subappName]` on the table `Subapp` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[versionName]` on the table `Version` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Subapp_subappName_key` ON `Subapp`(`subappName`);

-- CreateIndex
CREATE UNIQUE INDEX `Version_versionName_key` ON `Version`(`versionName`);
