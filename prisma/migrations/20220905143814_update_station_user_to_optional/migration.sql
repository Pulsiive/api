-- DropForeignKey
ALTER TABLE "Station" DROP CONSTRAINT "Station_ownerId_fkey";

-- AlterTable
ALTER TABLE "Station" ALTER COLUMN "ownerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Station" ADD CONSTRAINT "Station_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
