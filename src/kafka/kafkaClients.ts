import {KafkaConnection} from "@beemobot/common";
import {PremiumManagentClient} from "./clients/PremiumManagentClient.js";

export let premiumManagementClient: PremiumManagentClient
// TODO: Add actual use for this once we transition to using Kimbap as a centralized subscription handler.
function init(connection: KafkaConnection) {
    premiumManagementClient = new PremiumManagentClient(connection)
}