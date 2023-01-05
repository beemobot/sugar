import {Server} from "../types/server.js";
import {retriable, updatePlan} from "../utils/utils.js";
import {NO_PLAN} from "../utils/constants.js";
import {ChargebeeCustomer, ChargebeeSubscription} from "../types/chargebee.js";

async function process(server: Server, subscription: ChargebeeSubscription, customer: ChargebeeCustomer) {
    await retriable(
        'cancel ' + JSON.stringify({server: server.id }),
        async () => await updatePlan(server, NO_PLAN, subscription, customer)
    )
}

export const SubscriptionCancelProcessor = { process: process }