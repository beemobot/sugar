import { Event } from "chargebee-typescript/lib/resources";
import { RouterContext } from "koa-router";

const allowed_events: Event["event_type"][] = [
  "subscription_activated",
  "subscription_started",
  "subscription_paused",
  "subscription_cancelled",
];

export const hookController = async (ctx: RouterContext) => {
  const { event_type: eventType } = ctx.request.body as Event;
  console.log("Received hookController event", {
    body: ctx.request.body,
    eventType: eventType,
  });

  if (!allowed_events.includes(eventType || "")) {
    console.log("processctxuest found an unknown event", {
      event: eventType,
    });

    ctx.status = 404;
    ctx.body = {};
    return;
  }

  // TODO: Handle events
  console.log("Valid event: " + eventType);

  ctx.status = 200;
  ctx.body = {};
};
