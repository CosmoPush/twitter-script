/*
  Warnings:

  - You are about to drop the column `haveParent` on the `Tweet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tweet" DROP COLUMN "haveParent",
ADD COLUMN     "isReplyOnTwitter" BOOLEAN NOT NULL DEFAULT false;
