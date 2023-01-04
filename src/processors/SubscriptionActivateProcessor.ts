import {Server} from "../types/server";
import {Subscription} from "chargebee-typescript/lib/resources";
import {kafka} from "../connections/kafka";

// TODO: Use latte-js for sending kafka messages.
async function process(server: Server, subscription: Subscription) {
    try {
        console.info('Attempting to send subscription (' + subscription.id + ') for server (' + server.id + ') activation request...')
        await kafka.producer.send({ topic: kafka.topic, messages: [{ value: JSON.stringify({ guildId: server.id, premiumPlan: 'max' }) }]})
        console.info('Subscription (' + subscription.id + ') for server (' + server.id + ') activation request has been sent.')
    } catch (ex) {
        console.error('Failed to send activation request to Kafka for server (' + server.id + "). Retrying again in 10 seconds.", ex)
        await new Promise((resolve) => setTimeout(resolve, 10 * 1000))
        await process(server, subscription)
    }
}

export const SubscriptionActivateProcessor = { process: process }