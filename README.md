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