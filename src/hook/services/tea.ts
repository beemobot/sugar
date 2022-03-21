import { Subscription, Customer } from "../../types";
import { PrismaClient, SubscriptionStatus } from "@prisma/client";

const prisma = new PrismaClient();

const subscriptionUpsert = async (
  subscription: Subscription,
  customer: Customer
) => {
  const newStatus =
    subscription.status === "active"
      ? SubscriptionStatus.ACTIVE
      : SubscriptionStatus.CANCELLED;
  return prisma.subscription.upsert({
    create: {
      cb_subscription_id: subscription.id,
      status: newStatus,
      cb_customer: {
        connectOrCreate: {
          create: {
            cb_customer_id: subscription.customer_id,
            discord_discriminator: customer.cf_discord_discriminator,
            discord_id: Number(customer.cf_discord_id_dont_know_disgdfindmyid),
            email: customer.email,
          },
          where: {
            cb_customer_id: subscription.customer_id,
          },
        },
      },
      server_id: subscription.cf_discord_server_id,
      server_invite_link: subscription.cf_discord_server_invite,
      expiration_date: new Date(subscription.current_term_end * 1000),
    },
    update: {
      server_id: subscription.cf_discord_server_id,
      server_invite_link: subscription.cf_discord_server_invite,
      status: newStatus,
      expiration_date: new Date(subscription.current_term_end * 1000),
      updated_at: new Date(),
    },
    where: {
      cb_subscription_id: subscription.id,
    },
  });
};

export const activateSubscription = async (
  subscription: Subscription,
  customer: Customer
) => {
  const subscriptionInstance = await subscriptionUpsert(subscription, customer);
  // @TODO: Notify through Kafka
  if (subscriptionInstance.status === SubscriptionStatus.ACTIVE) {
    console.log("Active subscription", {
      subscriptionID: subscriptionInstance.cb_subscription_id,
    });
  } else {
    console.warn("Unexpected subscription status", {
      subscriptionID: subscriptionInstance.cb_subscription_id,
      status: subscriptionInstance.status,
    });
  }
};

export const changeSubscription = async (
  subscription: Subscription,
  customer: Customer
) => {
  const previousSubscription = await prisma.subscription.findUnique({
    where: { cb_subscription_id: subscription.id },
    select: {
      status: true,
    },
  });
  const subscriptionInstance = await subscriptionUpsert(subscription, customer);
  if (subscriptionInstance.status !== previousSubscription?.status) {
    // @TODO: Notify through Kafka
    console.log("Changed subscription", {
      subscriptionID: subscriptionInstance.cb_subscription_id,
    });
  } else {
    console.warn("Unexpected subscription status", {
      subscriptionID: subscriptionInstance.cb_subscription_id,
      status: subscriptionInstance.status,
    });
  }
};

export const cancelSubscription = async (
  subscription: Subscription,
  customer: Customer
) => {
  const subscriptionInstance = await subscriptionUpsert(subscription, customer);
  if (subscriptionInstance.status === SubscriptionStatus.CANCELLED) {
    // @TODO: Notify through Kafka
    console.log("Cancelled subscription", {
      subscriptionID: subscriptionInstance.cb_subscription_id,
    });
  } else {
    console.warn("Unexpected subscription status", {
      subscriptionID: subscriptionInstance.cb_subscription_id,
      status: subscriptionInstance.status,
    });
  }
};
