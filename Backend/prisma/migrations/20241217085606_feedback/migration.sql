-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "happy" BOOLEAN NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
