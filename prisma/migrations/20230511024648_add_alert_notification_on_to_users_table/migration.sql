-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAlertOn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isNotificationOn" BOOLEAN NOT NULL DEFAULT false;
