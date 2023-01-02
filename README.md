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

There is no setup currently available, this entire module is still in active development and hasn't even reached a single public 
version as of writing. This will be updated with proper installation once ready.