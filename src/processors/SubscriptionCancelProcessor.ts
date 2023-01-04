import {Subscription} from "chargebee-typescript/lib/resources";
import {Server} from "../types/server.js";
import {prisma, TAG} from "../index.js";
import {kafka} from "../connections/kafka.js";
import {chargebee} from "../connections/chargebee.js";
import {SubscriptionCancellations} from "@prisma/client";
import {KEY_SET_PREMIUM_PLAN, PREMIUM_PLAN_TOPIC} from "../kafka/clients/PremiumManagentClient.js";
import {createPremiumManagementData, createRecordHeaders} from "../utils/utils.js";
import {Logger} from "@beemobot/common";

async function process(server: Server, subscription: Subscription) {
    try {
        Logger.info(TAG, 'Attempting to process subscription (' + subscription.id + ') for server (' + server.id + ') cancellation request...')

        let cancel_at = subscription.cancelled_at;
        if (cancel_at == null) {
            if (subscription.pause_date == null) {
                Logger.wtf(TAG, `Subscription (${subscription.id}) doesn't seem to be cancellable.`)
                return
            }

            cancel_at = subscription.pause_date
        }

        const currentEpochSeconds = Math.round(Date.now() / 1000)
        if (currentEpochSeconds >= cancel_at) {
            await cancel(server)
            return
        }

        // DEBATABLE: I don't find a real point in keeping any cancellations that will happen in less than a minute, therefore, let's just cancel immediately.
        if (cancel_at - currentEpochSeconds <= 60) {
            Logger.info(TAG, 'Cancellation for subscription (' + subscription.id + ") is deemed too close for persistence (<= 60 seconds), proceeding immediate cancellation.")
            await resetPremiumPlan(server)
            return
        }

        await createPersistedCancellation(server, cancel_at, subscription)
        setTimeout(() => handleScheduledCancellation(server), (cancel_at - currentEpochSeconds) * 1000)
    } catch (ex) {
        Logger.error(TAG, 'An error occurred while trying to schedule cancellation for subscription (' + subscription.id + ') and server (' + server.id + ').', ex)
    }
}

async function handleScheduledCancellation(server: Server) {
    const persistedCancellationRequest: SubscriptionCancellations | null = await prisma.subscriptionCancellations.findFirst({ where: { guild_id: BigInt(server.id) }})

    if (persistedCancellationRequest == null) {
        Logger.error(TAG, 'Cancellation request for server (' + server.id + ") cannot be found. Discarding cancellation.")
        return
    }

    const subscription = (await chargebee.subscription.retrieve(persistedCancellationRequest.subscription_id).request()).subscription
    if (subscription == null) {
        Logger.error(TAG, 'Failed to find subscription (' + persistedCancellationRequest.subscription_id + ') for server (' + server.id + ') on Chargebee. ' +
            "Proceeding with premium plan reset.")
        await resetPremiumPlan(server)
        return
    }

    if (subscription.cancelled_at == null && subscription.pause_date == null) {
        Logger.error(TAG, "Subscription (" + persistedCancellationRequest.subscription_id + ") doesn't look to be under a cancelling state. Discarding cancellation.")
        await deletePersistedCancellation(server)
        return
    }

    Logger.info(TAG, 'Attempting to cancel subscription (' + persistedCancellationRequest.subscription_id + ') for server (' + server.id + ').')
    await cancel(server)
}

async function cancel(server: Server) {
    await resetPremiumPlan(server)
    await deletePersistedCancellation(server)
}

async function resetPremiumPlan(server: Server) {
    try {
        await kafka.send(PREMIUM_PLAN_TOPIC, KEY_SET_PREMIUM_PLAN, createPremiumManagementData(server, 'none'), createRecordHeaders())
    } catch (ex) {
        Logger.error(TAG, 'Failed to send cancellation request to Kafka for server (' + server.id + "). Retrying again in 10 seconds.", ex)
        await new Promise((resolve) => setTimeout(resolve, 10 * 1000))
        await resetPremiumPlan(server)
    }
}


async function deletePersistedCancellation(server: Server){
    try {
        const cancellation = await prisma.subscriptionCancellations.findFirst({ where: { guild_id: BigInt(server.id) } })
        if (cancellation != null) {
            await prisma.subscriptionCancellations.delete({ where: { guild_id: BigInt(server.id) } })
        }
    } catch (ex) {
        Logger.error(TAG, 'Failed to delete the cancellation request from the database for server (' + server.id + "). Retrying again in 10 seconds.", ex)
        setTimeout(async () => deletePersistedCancellation(server), 10 * 1000)
    }
}

async function createPersistedCancellation(server: Server, ends_at: number, subscription: Subscription) {
    try {
        await prisma.subscriptionCancellations.upsert({
            where: { guild_id: BigInt(server.id) },
            update: { cancels_at: ends_at },
            create: { guild_id: BigInt(server.id), cancels_at: BigInt(ends_at), subscription_id: subscription.id }
        })
    } catch (ex) {
        Logger.error(TAG, 'Failed to persist cancellation request to database for server (' + server.id + "). Retrying again in 10 seconds.", ex)
        await new Promise((resolve) => setTimeout(resolve, 10 * 1000))
        await createPersistedCancellation(server, ends_at, subscription)
    }
}

export const SubscriptionCancelProcessor = { process: process }