<div align="center">
    or gimbap, i was told.
</div>

##

Kimbap is an alternative module of Sugar for processing Chargebee subscriptions for Beemo. 

#### 🥱 Lazy

Unlike the original Sugar, this uses a lazy way of handling the subscriptions which is done by first taking the following 
properties of the webhook (`{ id, event_type, subscription: { id } }`) before requesting the entire subscription using 
the Chargebee API (to save time from validating and parsing).

#### 📖 Cancel-culture

Kimbap handles cancellations by first storing the cancellation in the database (`server, ends_at, subscription_id`) and scheduling the 
cancellation internally before looking into the database to see if the cancellation is still valid and also looking 
into Chargebee to ensure we aren't somehow cancelling an active subscription before sending it over to Kafka.

#### 🍾 Social

Kimbap is lazy. Kimbap simply directs most of the handling to its friend, in particularly Tea, using Kafka and for various 
reasons (initialization, synchronization, etc.). All Kimbap does is talk to Chargebee, schedule stuff and talk to Tea.

#### 📦 Setup

> **Warning**
> This assumes that the `.env` is configured properly and contains all the properties 
> that are needed. If not, please ensure that is done first.
> 
> Additionally, make sure that this does not use the same database as Tea or any existing project, it can be on the same 
> instance, but ensure that the database itself is different. Prisma will ask you to reset the database 
> if that happens, that's when you know it's the same table.

In order to set-up Kimbap, we have to first migrate our database with Prisma using the following command:
```shell
# Yarn
yarn run prisma migrate deploy

# Node
npx prisma migrate deploy
```

After doing so, you can now build the Docker image by running the following:
```shell
docker build -t kimbap .
```

Once the image is built, you can start the container by running the following command:
```shell
docker start --name kimbap -p [server_port]:[server_port] --env-file .env kimbap
```

> **Note**
> `[server_port]` should be the server port that you configured on the configuration 
> since that is what Kimbap uses.

### 🐝 Setting up with Chargebee

Before we can start receiving events from Chargebee, we have to configure Chargebee itself and to do that, let us 
first follow the steps:
1. Create a READ_ONLY key (can be found on the `/apikeys_and_webhooks/api` path of your Chargebee site) and install it into your configuration.
2. Add Kimbap into the webhooks (can be located on `/apikeys_and_webhooks/webhooks` path of your Chargebee site) and select the [following events](#-chargebee-events) plus configure the basic authentication.
3. Kimbap should now start receiving events.

### 🔥 Chargebee Events

The following events needed to be selected (nothing more, nothing less) to have Kimbap work:
- [x] Subscription Created
- [x] Subscription Created with Backdating
- [x] Subscription Reactivated
- [x] Subscription Reactivated with Backdating
- [x] Subscription Started
- [x] Subscription Paused
- [x] Subscription Cancelled
- [x] Subscription Resumed