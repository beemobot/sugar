import {Server} from "../types/server.js";
import {determinePlan, updatePlan} from "../utils/utils.js";
import {Logger} from "@beemobot/common";
import {TAG} from "../index.js";
import {ChargebeeSubscription} from "../types/chargebee.js";

async function process(server: Server, subscription: ChargebeeSubscription) {
    try {
        await updatePlan(server, determinePlan(subscription))
    } catch (ex) {
        Logger.error(TAG,'Failed to send activation request to Kafka for server (' + server.id + "). Retrying again in 10 seconds.", ex)
        await new Promise((resolve) => setTimeout(resolve, 10 * 1000))
        await process(server, subscription)
    }
}

export const SubscriptionActivateProcessor = { process: process }