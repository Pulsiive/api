/*
  Warnings:

  - You are about to drop the `StationComment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StationComment" DROP CONSTRAINT "StationComment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "StationComment" DROP CONSTRAINT "StationComment_stationId_fkey";

-- AlterTable
ALTER TABLE "Station" ADD COLUMN     "rateNumber" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "rate" SET DEFAULT 0,
ALTER COLUMN "rate" SET DATA TYPE DOUBLE PRECISION;

-- DropTable
DROP TABLE "StationComment";

-- CreateTable
CREATE TABLE "StationRating" (
    "id" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "rate" INTEGER NOT NULL,
    "comment" TEXT,
    "pictures" TEXT[],
    "date" TIMESTAMP(3) NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StationRating_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StationRating" ADD CONSTRAINT "StationRating_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationRating" ADD CONSTRAINT "StationRating_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;
