/*
  Warnings:

  - The primary key for the `subscription` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `chargebee_subscription_id` on the `subscription` table. All the data in the column will be lost.
  - Added the required column `cb_subscription_id` to the `subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_pkey",
DROP COLUMN "chargebee_subscription_id",
ADD COLUMN     "cb_subscription_id" TEXT NOT NULL,
ADD CONSTRAINT "subscription_pkey" PRIMARY KEY ("cb_subscription_id");
