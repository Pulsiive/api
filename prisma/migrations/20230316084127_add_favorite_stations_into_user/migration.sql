-- CreateTable
CREATE TABLE "_Favorite" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Favorite_AB_unique" ON "_Favorite"("A", "B");

-- CreateIndex
CREATE INDEX "_Favorite_B_index" ON "_Favorite"("B");

-- AddForeignKey
ALTER TABLE "_Favorite" ADD CONSTRAINT "_Favorite_A_fkey" FOREIGN KEY ("A") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Favorite" ADD CONSTRAINT "_Favorite_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
