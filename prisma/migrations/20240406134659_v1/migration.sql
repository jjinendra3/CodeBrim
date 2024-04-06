-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "stdin" TEXT,
    "stdout" TEXT,
    "stderr" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
