-- CreateTable
CREATE TABLE "QuizHighScore" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizHighScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuizHighScore_score_idx" ON "QuizHighScore"("score");
