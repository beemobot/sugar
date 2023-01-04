import dotenv from 'dotenv'

import {Chargebee} from "./connections/chargebee";
import {Koffaka} from "./connections/kafka";
import {Expresso} from "./connections/express";
import {PrismaClient} from "@prisma/client";

dotenv.config()

export const prisma: PrismaClient = new PrismaClient()
async function init() {
    try {
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