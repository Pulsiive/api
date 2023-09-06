-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "responseToRatingId" TEXT,
ALTER COLUMN "rate" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_responseToRatingId_fkey" FOREIGN KEY ("responseToRatingId") REFERENCES "Rating"("id") ON DELETE CASCADE ON UPDATE CASCADE;
