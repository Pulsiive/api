/*
  Warnings:

  - You are about to drop the `StationHours` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StationHours" DROP CONSTRAINT "StationHours_stationPropertiesId_fkey";

-- DropTable
DROP TABLE "StationHours";

-- CreateTable
CREATE TABLE "Slot" (
    "id" TEXT NOT NULL,
    "stationPropertiesId" TEXT NOT NULL,
    "day" SMALLINT NOT NULL,
    "opensAt" TIME(0) NOT NULL,
    "closesAt" TIME(0) NOT NULL,

    CONSTRAINT "Slot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_stationPropertiesId_fkey" FOREIGN KEY ("stationPropertiesId") REFERENCES "StationProperties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
