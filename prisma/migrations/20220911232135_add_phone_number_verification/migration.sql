-- CreateTable
CREATE TABLE "PhoneNumberVerification" (
    "id" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhoneNumberVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PhoneNumberVerification_phoneNumber_key" ON "PhoneNumberVerification"("phoneNumber");
