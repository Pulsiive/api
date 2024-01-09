-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "phoneVerifiedAt" TIMESTAMP(3),
ALTER COLUMN "profilePictureId" SET DEFAULT E'149c05a9-7985-4b8e-8c81-956826888b53';
