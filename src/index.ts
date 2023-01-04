import dotenv from 'dotenv'

import {Chargebee} from "./connections/chargebee.js";
import {Koffaka} from "./connections/kafka.js";
import {Expresso} from "./connections/express.js";
import {PrismaClient} from "@prisma/client";
import {Sentryboo} from "./connections/sentry.js";

dotenv.config()

export const prisma: PrismaClient = new PrismaClient()
export const TAG = "Kimbap"
async function init() {
    try {
        Sentryboo.init()
        Chargebee.init()
        await Koffaka.init()
        Expresso.init()
    } catch (ex) {
        console.error('Failed to continue prerequisites task for startup.', ex)
    }
}

init()
    .then(async () => await prisma.$disconnect())
    .catch(async () => await prisma.$disconnect())