/*
  Warnings:

  - You are about to drop the column `subscription_status` on the `subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "subscription_status",
ADD COLUMN     "status" "SubscriptionStatus" NOT NULL DEFAULT E'ACTIVE';
