-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "from" TIME(0) NOT NULL,
    "to" TIME(0) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "Slot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
