/*
  Warnings:

  - Added the required column `postalCode` to the `StationCoordinates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StationCoordinates" ADD COLUMN     "postalCode" INTEGER NOT NULL;
