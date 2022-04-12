/*
  Warnings:

  - Added the required column `eletricalType` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VehicleElectricalType" AS ENUM ('BEV', 'HEV', 'PHEV');

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "eletricalType" "VehicleElectricalType" NOT NULL;
