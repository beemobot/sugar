import {Server} from "../types/server.js";
import {Subscription} from "chargebee-typescript/lib/resources";
import {kafka} from "../connections/kafka.js";
import {KEY_SET_PREMIUM_PLAN, PREMIUM_PLAN_TOPIC} from "../kafka/clients/PremiumManagentClient.js";
import {createPremiumManagementData, createRecordHeaders} from "../utils/utils.js";
import {Logger} from "@beemobot/common";
import {TAG} from "../index.js";

async function process(server: Server, subscription: Subscription) {
    try {
        Logger.info(TAG,'Attempting to send subscription (' + subscription.id + ') for server (' + server.id + ') activation request...')
        await kafka.send(PREMIUM_PLAN_TOPIC, KEY_SET_PREMIUM_PLAN, createPremiumManagementData(server, 'max'), createRecordHeaders())
        Logger.info(TAG,'Subscription (' + subscription.id + ') for server (' + server.id + ') activation request has been sent.')
    } catch (ex) {
        Logger.error(TAG,'Failed to send activation request to Kafka for server (' + server.id + "). Retrying again in 10 seconds.", ex)
        await new Promise((resolve) => setTimeout(resolve, 10 * 1000))
        await process(server, subscription)
    }
}

export const SubscriptionActivateProcessor = { process: process }