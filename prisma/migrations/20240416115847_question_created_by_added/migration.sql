/*
  Warnings:

  - Added the required column `createdById` to the `Questions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Questions" ADD COLUMN     "createdById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
