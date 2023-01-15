/*
  Warnings:

  - You are about to drop the column `day` on the `Slot` table. All the data in the column will be lost.
  - You are about to drop the `Reservation` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `opensAt` on the `Slot` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `closesAt` on the `Slot` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_slotId_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_userId_fkey";

-- AlterTable
ALTER TABLE "Slot" DROP COLUMN "day",
ADD COLUMN     "driverId" TEXT,
ADD COLUMN     "isBooked" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "opensAt",
ADD COLUMN     "opensAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "closesAt",
ADD COLUMN     "closesAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Reservation";

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
