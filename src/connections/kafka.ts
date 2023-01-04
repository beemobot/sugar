import {Kafka, Producer} from "kafkajs";

export let kafka: { producer: Producer, topic: string }

async function init() {
    process.env.KAFKAJS_NO_PARTITIONER_WARNING = "1"
    if (process.env.KAFKA_CLIENT_ID == null || process.env.KAFKA_BROKERS == null || process.env.KAFKA_TOPIC == null) {
        console.error('Kafka is not configured, discarding request to start.')
        process.exit()
        return
    }
    let kafkaConnection = new Kafka({ clientId: process.env.KAFKA_CLIENT_ID, brokers: process.env.KAFKA_BROKERS.split(',') })
    kafka = { producer: kafkaConnection.producer(), topic: process.env.KAFKA_TOPIC }

    await kafka.producer.connect()
}

export const Koffaka = { init: init }