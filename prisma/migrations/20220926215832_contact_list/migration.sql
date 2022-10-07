/*
  Warnings:

  - You are about to drop the column `userId` on the `Contacts` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `Contacts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Contacts" DROP CONSTRAINT "Contacts_userId_fkey";

-- AlterTable
ALTER TABLE "Contacts" DROP COLUMN "userId",
ADD COLUMN     "authorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
