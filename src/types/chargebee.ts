import {Record, Static, String} from "runtypes";

export const ChargebeeEvent = Record({
    id: String,
    event_type: String,
    content: Record({
        subscription: Record({
            id: String
        })
    })
})

export type ChargebeeEvent = Static<typeof ChargebeeEvent>