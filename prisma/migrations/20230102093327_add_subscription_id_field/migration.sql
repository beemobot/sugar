/*
  Warnings:

  - Added the required column `subscription_id` to the `SubscriptionCancellations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubscriptionCancellations" ADD COLUMN     "subscription_id" TEXT NOT NULL;
