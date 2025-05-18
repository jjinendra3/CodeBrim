/*
  Warnings:

  - You are about to drop the column `filename` on the `Files` table. All the data in the column will be lost.
  - Added the required column `name` to the `Files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Files" DROP COLUMN "filename",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "content" DROP DEFAULT,
ALTER COLUMN "stdin" DROP NOT NULL,
ALTER COLUMN "stdin" DROP DEFAULT,
ALTER COLUMN "stdout" DROP NOT NULL,
ALTER COLUMN "stdout" DROP DEFAULT,
ALTER COLUMN "lang" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
