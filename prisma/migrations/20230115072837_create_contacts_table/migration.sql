-- CreateTable
CREATE TABLE "Contacts" (
    "id" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contacts_contactName_key" ON "Contacts"("contactName");

-- AddForeignKey
ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
