/*
  Warnings:

  - Made the column `content` on table `Files` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stderr` on table `Files` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stdin` on table `Files` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stdout` on table `Files` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Files" ALTER COLUMN "content" SET NOT NULL,
ALTER COLUMN "content" SET DEFAULT '',
ALTER COLUMN "stderr" SET NOT NULL,
ALTER COLUMN "stderr" SET DEFAULT '',
ALTER COLUMN "stdin" SET NOT NULL,
ALTER COLUMN "stdin" SET DEFAULT '',
ALTER COLUMN "stdout" SET NOT NULL,
ALTER COLUMN "stdout" SET DEFAULT '';
