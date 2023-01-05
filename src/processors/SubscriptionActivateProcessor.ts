import {Server} from "../types/server.js";
import {determinePlan, retriable, updatePlan} from "../utils/utils.js";
import {ChargebeeSubscription} from "../types/chargebee.js";

async function process(server: Server, subscription: ChargebeeSubscription) {
    await retriable(
        'activate ' + JSON.stringify({server: server.id, subscription: subscription.id}),
        async () => await updatePlan(server, determinePlan(subscription))
    )
}

export const SubscriptionActivateProcessor = { process: process }