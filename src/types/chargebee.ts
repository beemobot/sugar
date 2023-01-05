import {Record, Static, String} from "runtypes";

export const ChargebeeSubscription = Record({
    id: String,
    plan_id: String,
    status: String,
    cf_discord_server_id: String
})

export const ChargebeeEvent = Record({
    id: String,
    event_type: String,
    content: Record({
        subscription: ChargebeeSubscription
    })
})

export type ChargebeeEvent = Static<typeof ChargebeeEvent>
export type ChargebeeSubscription = Static<typeof ChargebeeSubscription>