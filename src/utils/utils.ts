import {Server} from "../types/server.js";
import {KafkaMessageHeaders} from "@beemobot/common";

export function createPremiumManagementData(server: Server, plan: 'max' | 'none') {
    return '{"guildId":' + server.id +',"premiumPlan":"'+plan+'"}'
}

export function createRecordHeaders() {
    return new KafkaMessageHeaders('sugar-kimbap', '-2')
}