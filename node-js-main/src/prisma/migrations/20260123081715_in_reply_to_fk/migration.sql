/*
  Warnings:

  - You are about to drop the column `isReplyOnTwitter` on the `Tweet` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tweet" DROP CONSTRAINT "Tweet_in_reply_to_fkey";

-- AlterTable
ALTER TABLE "Tweet" DROP COLUMN "isReplyOnTwitter",
ADD COLUMN     "in_reply_to_fk" TEXT;

-- AddForeignKey
ALTER TABLE "Tweet" ADD CONSTRAINT "Tweet_in_reply_to_fk_fkey" FOREIGN KEY ("in_reply_to_fk") REFERENCES "Tweet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
