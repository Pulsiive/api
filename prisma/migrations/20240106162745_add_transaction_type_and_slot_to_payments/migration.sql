-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "slotId" TEXT,
ADD COLUMN     "transaction_type" TEXT NOT NULL DEFAULT E'debit';

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "Slot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
