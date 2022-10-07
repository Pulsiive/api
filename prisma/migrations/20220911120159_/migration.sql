-- CreateTable
CREATE TABLE "Contacts" (
    "id" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,

    CONSTRAINT "Contacts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_contactName_fkey" FOREIGN KEY ("contactName") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
