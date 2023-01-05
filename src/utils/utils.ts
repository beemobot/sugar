import {Server} from "../types/server.js";
import {KafkaMessageHeaders, Logger} from "@beemobot/common";
import plans from "../../configs/plans.json" assert { type: 'json' };
import {NO_PLAN} from "./constants.js";
import {kafka} from "../connections/kafka.js";
import {KEY_SET_PREMIUM_PLAN, PREMIUM_PLAN_TOPIC} from "../kafka/clients/PremiumManagentClient.js";
import {TAG} from "../index.js";
import {ChargebeeSubscription} from "../types/chargebee.js";

export function createPremiumManagementData(server: Server, plan: string) {
    return '{"guildId":' + server.id +',"premiumPlan":"'+plan+'"}'
}

export function createRecordHeaders() {
    return new KafkaMessageHeaders('sugar-kimbap', '-2')
}

export function determinePlan(subscription: ChargebeeSubscription): string {
    if (subscription.status !== 'active') return NO_PLAN
    for (const plan of plans.plans) {
        if (plan.ids.includes(subscription.plan_id)) {
            return plan.name
        }
    }

    return NO_PLAN
}

export async function updatePlan(server: Server, plan: string) {
    Logger.info(TAG, 'Sending UPDATE PLAN for server (' + server.id + ") with new plan (" + plan + ').')
    await kafka.send(PREMIUM_PLAN_TOPIC, KEY_SET_PREMIUM_PLAN, createPremiumManagementData(server, plan), createRecordHeaders())
    Logger.info(TAG, 'Kafka has accepted UPDATE PLAN for server (' + server.id + ") with new plan (" + plan + ').')
}