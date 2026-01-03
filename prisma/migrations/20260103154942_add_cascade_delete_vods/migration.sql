/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_createdById_fkey";

-- DropForeignKey
ALTER TABLE "VOD" DROP CONSTRAINT "VOD_channelId_fkey";

-- DropTable
DROP TABLE "Post";

-- AddForeignKey
ALTER TABLE "VOD" ADD CONSTRAINT "VOD_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "TwitchChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
