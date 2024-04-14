/*
  Warnings:

  - You are about to drop the column `path` on the `Files` table. All the data in the column will be lost.
  - You are about to drop the column `stderr` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stdin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stdout` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Files" DROP COLUMN "path",
ADD COLUMN     "stderr" TEXT,
ADD COLUMN     "stdin" TEXT,
ADD COLUMN     "stdout" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "stderr",
DROP COLUMN "stdin",
DROP COLUMN "stdout";
