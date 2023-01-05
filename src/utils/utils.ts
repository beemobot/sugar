import {Server} from "../types/server.js";
import {KafkaMessageHeaders, Logger} from "@beemobot/common";
import plans from "../../configs/plans.json" assert { type: 'json' };
import {NO_PLAN} from "./constants.js";
import {kafka} from "../connections/kafka.js";
import {KEY_SET_PREMIUM_PLAN, PREMIUM_PLAN_TOPIC} from "../kafka/clients/PremiumManagentClient.js";
import {TAG} from "../index.js";
import {ChargebeeCustomer, ChargebeeSubscription} from "../types/chargebee.js";
import * as Sentry from '@sentry/node';
import {DiscordWebhook} from "../connections/discord.js";
import {Colors} from "discord.js";

export function createPremiumManagementData(server: Server, plan: string) {
    return '{"guildId":' + server.id +',"premiumPlan":"'+plan+'"}'
}

export function createRecordHeaders() {
    return new KafkaMessageHeaders('sugar-kimbap', '-2')
}

export function determinePlan(subscription: ChargebeeSubscription): string {
    if (subscription.status !== 'active') return NO_PLAN
    for (const plan of plans.plans) {
        if (plan.ids.includes(subscription.plan_id)) {
            return plan.name
        }
    }

    return NO_PLAN
}

export async function updatePlan(server: Server, plan: string, subscription: ChargebeeSubscription, customer: ChargebeeCustomer) {
    Logger.info(TAG, 'Sending UPDATE PLAN for server (' + server.id + ") with new plan (" + plan + ').')
    await kafka.send(PREMIUM_PLAN_TOPIC, KEY_SET_PREMIUM_PLAN, createPremiumManagementData(server, plan), createRecordHeaders())
    Logger.info(TAG, 'Kafka has accepted UPDATE PLAN for server (' + server.id + ") with new plan (" + plan + ').')
    sendWebhook(server, plan, subscription, customer)
}

function sendWebhook(server: Server, plan: string, subscription: ChargebeeSubscription, customer: ChargebeeCustomer) {
    if (plan !== 'none') {
        DiscordWebhook.send({
            embeds: [
                {
                    title: 'Subscription Activated',
                    description: 'The subscription for the following server has been successfully activated with the following details.',
                    fields: [
                        {
                            name: 'Details',
                            value: [
                                '**Server**: ' + formatServer(server),
                                '**Plan**: ' + plan.toUpperCase(),
                                '**Subscription**: ' + formatSubscription(subscription),
                                '**User**: ' + formatCustomer(customer),
                            ].join('\n'),
                        }
                    ],
                    color: Colors.Gold
                }
            ]
        })
        return
    }

    DiscordWebhook.send({
        embeds: [
            {
                title: 'Subscription Cancelled',
                description: 'The subscription for the following server has been cancelled with the following details.',
                fields: [
                    {
                        name: 'Details',
                        value: [
                            '**Server**: ' + formatServer(server),
                            '**Subscription**: ' + formatSubscription(subscription),
                            '**User**: ' + formatCustomer(customer),
                        ].join('\n'),
                    }
                ],
                color: Colors.Red
            }
        ]
    })
}

function formatSubscription(subscription: ChargebeeSubscription) {
    return '[' + subscription.id + ']' +
        '(https://' + process.env.CHARGEBEE_SITE + '.chargebee.com/subscriptions/' +  subscription.id + '/details)'
}

function formatCustomer(customer: ChargebeeCustomer) {
    return customer.cf_discord_discriminator + ' (`' + customer.cf_discord_id_dont_know_disgdfindmyid + '`)'
}

function formatServer(server: Server) {
    return '`' + server.id + '`'
}

export function retriable(task: string, action: () => Promise<void>, retries: number = 1) {
    action()
        .catch((exception) => {
            if (retries === 1) {
                Sentry.setExtra('task', task)
                Sentry.captureException(exception)
            }

            Logger.error(TAG, 'Failed to complete ' + task + '. Retrying in ' +  (10 * retries) + ' seconds.\n', exception)
            setTimeout(() => retriable(task, action, retries + 1), (10 * retries) * 1000)
        })
}

export function createTaskName(subscription: ChargebeeSubscription, customer: ChargebeeCustomer) {
    let task = 'Activation';
    if (subscription.status !== 'active') {
        task = 'Cancellation'
    }

    return task + ' ' + JSON.stringify({ server: subscription.cf_discord_server_id, plan: subscription.plan_id,
        user: customer.cf_discord_id_dont_know_disgdfindmyid })
}