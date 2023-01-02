import {ChargebeeEvent} from "../types/chargebee";
import {ValidationError} from "runtypes";
import express from "express";
import { chargebee } from "../connections/chargebee";
import {Server} from "../types/server";
import {kafka} from "../connections/kafka";

const router = express.Router()

// IMPORTANT: Make sure all these events are implemented before adding them to this list.
const supported_events: string[] = [
    "subscription_activated",
    "subscription_resumed",
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

        const subscription = (await chargebee.subscription.retrieve(event.content.subscription.id).request()).subscription
        if (subscription == null) {
            console.error(`Failed to find the subscription (${event.content.subscription.id}).`)
            response.sendStatus(500)
            return
        }

        const server: Server = { id: subscription.cf_discord_server_id }

        // TODO: Have different handling based on the event_type, for example, if cancellation then do not send and
        //       instead place on schedule while storing the cancellations on the database (for persistence) while having
        //       the scheduler remove that specific row once the cancellation was proceeded.
        //       Additional notes: Cancellation will re-check on the database first, then re-checks Chargebee to see if
        //       it is still cancelled to ensure we aren't canceling a somehow still-active subscription.
        await kafka.producer.send({
            topic: kafka.topic,
            messages: [
                { value: JSON.stringify({ event: event.event_type, server: server.id }) }
            ]
        })

        processed_events.add(event.id)
    } catch (exception) {
        if (exception instanceof ValidationError) {
            response.status(400).json({ error: 'Invalid Request.' })
        }
    }
})

export default router