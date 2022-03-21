-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "subscription" (
    "chargebee_subscription_id" TEXT NOT NULL,
    "server_id" TEXT NOT NULL,
    "server_invite_link" TEXT,
    "subscription_status" "SubscriptionStatus" NOT NULL DEFAULT E'ACTIVE',
    "cb_customer_id" TEXT NOT NULL,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("chargebee_subscription_id")
);

-- CreateTable
CREATE TABLE "cb_customer" (
    "cb_customer_id" TEXT NOT NULL,
    "discord_discriminator" TEXT NOT NULL,
    "discord_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cb_customer_pkey" PRIMARY KEY ("cb_customer_id")
);

-- CreateIndex
CREATE INDEX "server_id_index" ON "subscription"("server_id");

-- CreateIndex
CREATE UNIQUE INDEX "cb_customer_cb_customer_id_key" ON "cb_customer"("cb_customer_id");

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_cb_customer_id_fkey" FOREIGN KEY ("cb_customer_id") REFERENCES "cb_customer"("cb_customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;
