/*
  Warnings:

  - You are about to drop the column `creteddate` on the `contact` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `contact` table. All the data in the column will be lost.
  - Added the required column `phone` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `contact` DROP COLUMN `creteddate`,
    DROP COLUMN `phoneNumber`,
    ADD COLUMN `createdate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `phone` VARCHAR(191) NOT NULL;
