/*
  Warnings:

  - You are about to drop the column `bannerImage` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `reviewCount` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `totalBooked` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Business" DROP COLUMN "bannerImage",
ADD COLUMN     "bannerImages" TEXT[];

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "reviewCount",
DROP COLUMN "totalBooked",
ADD COLUMN     "activeBookings" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalReviews" INTEGER NOT NULL DEFAULT 0;
