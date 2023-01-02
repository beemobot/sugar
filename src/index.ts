import dotenv from 'dotenv'

import {PrismaClient} from "prisma/prisma-client/scripts/default-index";
import {Chargebee} from "./connections/chargebee";
import {Koffaka} from "./connections/kafka";
import {Expresso} from "./connections/express";

dotenv.config()

export const prisma = new PrismaClient()
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