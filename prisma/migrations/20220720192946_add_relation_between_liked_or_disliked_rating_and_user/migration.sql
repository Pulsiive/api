-- CreateTable
CREATE TABLE "_likedRatings" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_dislikedRatings" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_likedRatings_AB_unique" ON "_likedRatings"("A", "B");

-- CreateIndex
CREATE INDEX "_likedRatings_B_index" ON "_likedRatings"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_dislikedRatings_AB_unique" ON "_dislikedRatings"("A", "B");

-- CreateIndex
CREATE INDEX "_dislikedRatings_B_index" ON "_dislikedRatings"("B");

-- AddForeignKey
ALTER TABLE "_likedRatings" ADD FOREIGN KEY ("A") REFERENCES "StationRating"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_likedRatings" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_dislikedRatings" ADD FOREIGN KEY ("A") REFERENCES "StationRating"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_dislikedRatings" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
