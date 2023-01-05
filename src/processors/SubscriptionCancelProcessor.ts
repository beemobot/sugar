import {Server} from "../types/server.js";
import {TAG} from "../index.js";
import {updatePlan} from "../utils/utils.js";
import {Logger} from "@beemobot/common";
import {NO_PLAN} from "../utils/constants.js";

async function process(server: Server) {
    try {
        await updatePlan(server, NO_PLAN)
    } catch (ex) {
        Logger.error(TAG,'Failed to send CANCELLATION UPDATE to Kafka for server (' + server.id + "). Retrying again in 10 seconds.", ex)
        await new Promise((resolve) => setTimeout(resolve, 10 * 1000))
        await process(server)
    }
}

export const SubscriptionCancelProcessor = { process: process }