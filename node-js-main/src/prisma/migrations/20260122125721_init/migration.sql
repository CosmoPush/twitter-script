-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "screen_name" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "followers_count" INTEGER NOT NULL,
    "verified" BOOLEAN NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tweet" (
    "id" TEXT NOT NULL,
    "full_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "lang" TEXT NOT NULL,
    "in_reply_to" TEXT,
    "view_count" INTEGER,
    "reply_count" INTEGER,
    "retweet_count" INTEGER,
    "favorite_count" INTEGER,
    "quote_count" INTEGER,
    "userId" INTEGER NOT NULL,
    "media" JSONB,

    CONSTRAINT "Tweet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_screen_name_key" ON "User"("screen_name");

-- AddForeignKey
ALTER TABLE "Tweet" ADD CONSTRAINT "Tweet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tweet" ADD CONSTRAINT "Tweet_in_reply_to_fkey" FOREIGN KEY ("in_reply_to") REFERENCES "Tweet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
