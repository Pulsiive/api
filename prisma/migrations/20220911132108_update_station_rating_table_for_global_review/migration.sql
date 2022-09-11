/*
  Warnings:

  - You are about to drop the `StationRating` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_dislikedRatings" DROP CONSTRAINT "_dislikedRatings_A_fkey";

-- DropForeignKey
ALTER TABLE "_likedRatings" DROP CONSTRAINT "_likedRatings_A_fkey";

-- DropForeignKey
ALTER TABLE "StationRating" DROP CONSTRAINT "StationRating_authorId_fkey";

-- DropForeignKey
ALTER TABLE "StationRating" DROP CONSTRAINT "StationRating_stationId_fkey";

-- DropTable
DROP TABLE "StationRating";

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT,
    "stationId" TEXT,
    "authorId" TEXT NOT NULL,
    "rate" INTEGER NOT NULL,
    "comment" TEXT,
    "pictures" TEXT[],
    "date" TIMESTAMP(3) NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_likedRatings" ADD FOREIGN KEY ("A") REFERENCES "Rating"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_dislikedRatings" ADD FOREIGN KEY ("A") REFERENCES "Rating"("id") ON DELETE CASCADE ON UPDATE CASCADE;
