import {Server} from "../types/server.js";
import {retriable, updatePlan} from "../utils/utils.js";
import {NO_PLAN} from "../utils/constants.js";

async function process(server: Server) {
    await retriable(
        'cancel ' + JSON.stringify({server: server.id }),
        async () => await updatePlan(server, NO_PLAN)
    )
}

export const SubscriptionCancelProcessor = { process: process }