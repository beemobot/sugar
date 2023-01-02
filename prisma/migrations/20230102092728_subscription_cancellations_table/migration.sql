-- CreateTable
CREATE TABLE "SubscriptionCancellations" (
    "guild_id" BIGINT NOT NULL,
    "cancels_at" BIGINT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionCancellations_guild_id_key" ON "SubscriptionCancellations"("guild_id");
