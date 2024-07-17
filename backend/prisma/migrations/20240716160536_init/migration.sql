/*
  Warnings:

  - Made the column `subcriptionStatus` on table `contact` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `contact` MODIFY `subcriptionStatus` VARCHAR(191) NOT NULL DEFAULT 'Unsubscribed';
