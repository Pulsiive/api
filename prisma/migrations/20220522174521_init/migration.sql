-- DropForeignKey
ALTER TABLE "StationComment" DROP CONSTRAINT "StationComment_stationId_fkey";

-- DropForeignKey
ALTER TABLE "StationCoordinates" DROP CONSTRAINT "StationCoordinates_stationId_fkey";

-- DropForeignKey
ALTER TABLE "StationHours" DROP CONSTRAINT "StationHours_stationPropertiesId_fkey";

-- DropForeignKey
ALTER TABLE "StationProperties" DROP CONSTRAINT "StationProperties_stationId_fkey";

-- AddForeignKey
ALTER TABLE "StationCoordinates" ADD CONSTRAINT "StationCoordinates_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationProperties" ADD CONSTRAINT "StationProperties_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationHours" ADD CONSTRAINT "StationHours_stationPropertiesId_fkey" FOREIGN KEY ("stationPropertiesId") REFERENCES "StationProperties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationComment" ADD CONSTRAINT "StationComment_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;
