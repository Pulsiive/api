/*
  Warnings:

  - You are about to drop the column `orderId` on the `Station` table. All the data in the column will be lost.
  - Added the required column `stationId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Station" DROP CONSTRAINT "Station_orderId_fkey";

-- DropIndex
DROP INDEX "Station_orderId_key";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "stationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Station" DROP COLUMN "orderId",
ALTER COLUMN "rate" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
