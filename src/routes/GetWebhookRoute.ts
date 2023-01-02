import { ChargebeeEvent } from "../types/chargebee";
import { ValidationError } from "runtypes";
import express from "express";
import { chargebee } from "../connections/chargebee";
import { Server } from "../types/server";
import { SubscriptionCancelProcessor } from "../processors/SubscriptionCancelProcessor";
import {SubscriptionActivateProcessor} from "../processors/SubscriptionActivateProcessor";

const router = express.Router()

// IMPORTANT: Make sure all these events are implemented before adding them to this list.
const supported_events: string[] = [
    "subscription_activated",
    "subscription_paused",
    "subscription_cancelled"
]

// IMPORTANT: This contains an array of all the ids that we have processed, to prevent duplicate handling within
// the lifetime of the application.
const processed_events: Set<string> = new Set();

router.get('webhook', async (request, response) => {
    try {
        if (request.body == null) {
            response.status(400).json({ error: 'Invalid request.' })
            return
        }

        const event = ChargebeeEvent.check(request.body)
        if (!supported_events.includes(event.event_type.toLowerCase())) {
            response.status(400).json({ error: 'Unsupported event.'})
            return
        }

        if (processed_events.has(event.id)) {
            response.status(204).json({ error: 'Duplicate event.'})
            return
        }

        processed_events.add(event.id)

        const subscription = (await chargebee.subscription.retrieve(event.content.subscription.id).request()).subscription
        if (subscription == null) {
            console.error(`Failed to find the subscription (${event.content.subscription.id}).`)
            response.sendStatus(500)
            return
        }

        // DEBATABLE: We should just tell Chargebee to go ahead and continue it's day before we finish processing.
        // Because the retries on our side (e.g. when persisting cancellations to db or sending to kafka) takes more
        // than 10 seconds each retry which is way past Chargebee's timeout.
        response.sendStatus(204)

        const server: Server = { id: subscription.cf_discord_server_id }
        if (event.event_type === 'subscription_paused' || event.event_type === 'subscription_cancelled') {
            // Webstorm won't stop nagging about the result for this Promise being ignored.
            SubscriptionCancelProcessor.process(server, subscription).then(() => {})
        }

        SubscriptionActivateProcessor.process(server, subscription).then(() => {})
    } catch (exception) {
        if (exception instanceof ValidationError) {
            response.status(400).json({ error: 'Invalid Request.' })
            return
        }

        console.error('An exception occurred while trying to handle webhook request.', exception)
    }
})

export default router