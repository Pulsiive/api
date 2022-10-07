/*
  Warnings:

  - Added the required column `userId` to the `Contacts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Contacts" DROP CONSTRAINT "Contacts_contactName_fkey";

-- AlterTable
ALTER TABLE "Contacts" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
