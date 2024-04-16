/*
  Warnings:

  - You are about to drop the column `edit` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lang` on the `User` table. All the data in the column will be lost.
  - Added the required column `lang` to the `Files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Files" ADD COLUMN     "lang" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "edit",
DROP COLUMN "lang";
