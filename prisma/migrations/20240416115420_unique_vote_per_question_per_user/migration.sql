/*
  Warnings:

  - A unique constraint covering the columns `[userId,questionId]` on the table `Votes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Votes_userId_questionId_key" ON "Votes"("userId", "questionId");
