-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'SCOOTER', 'MOTORBIKE', 'BIKE');

-- CreateEnum
CREATE TYPE "PlugType" AS ENUM ('TYPE1', 'TYPE2', 'TYPE3', 'CCS', 'CHADEMO', 'GREENUP');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "balance" INTEGER NOT NULL,
    "timeZone" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL DEFAULT E'CAR',
    "plugTypes" "PlugType"[],
    "maxPower" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Station" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "rate" INTEGER NOT NULL,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationCoordinates" (
    "id" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "lat" DECIMAL(65,30) NOT NULL,
    "long" DECIMAL(65,30) NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,

    CONSTRAINT "StationCoordinates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationProperties" (
    "id" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL,
    "maxPower" DECIMAL(65,30) NOT NULL,
    "price" INTEGER NOT NULL,
    "nbChargingPoints" INTEGER NOT NULL,
    "isGreenEnergy" BOOLEAN NOT NULL,
    "plugTypes" "PlugType"[],

    CONSTRAINT "StationProperties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationHours" (
    "id" TEXT NOT NULL,
    "stationPropertiesId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "openTime" TIMESTAMP(3) NOT NULL,
    "closeTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StationHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationComment" (
    "id" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "rate" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "pictures" TEXT[],
    "dates" TIMESTAMP(3) NOT NULL,
    "likes" INTEGER NOT NULL,

    CONSTRAINT "StationComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Station_orderId_key" ON "Station"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "StationCoordinates_stationId_key" ON "StationCoordinates"("stationId");

-- CreateIndex
CREATE UNIQUE INDEX "StationProperties_stationId_key" ON "StationProperties"("stationId");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station" ADD CONSTRAINT "Station_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station" ADD CONSTRAINT "Station_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationCoordinates" ADD CONSTRAINT "StationCoordinates_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationProperties" ADD CONSTRAINT "StationProperties_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationHours" ADD CONSTRAINT "StationHours_stationPropertiesId_fkey" FOREIGN KEY ("stationPropertiesId") REFERENCES "StationProperties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationComment" ADD CONSTRAINT "StationComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationComment" ADD CONSTRAINT "StationComment_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
