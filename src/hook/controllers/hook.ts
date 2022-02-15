import { Event } from "chargebee-typescript/lib/resources";
import { RequestHandler } from "express";

const allowed_events = [
  "subscription_activated",
  "subscription_started",
  "subscription_activated",
];

export const hookController: RequestHandler<{}, {}, Event> = async (
  req,
  res
) => {
  console.log("Received hookController event", {
    body: req.body,
    eventType: req.body.event_type,
  });

  if (!allowed_events.includes(req.body.event_type || "")) {
    console.log("processRequest found an unknown event", {
      event: req.body.event_type,
    });

    res.status(401).json({});
    return;
  }

  // TODO: Handle events
  console.log("Valid event: " + req.body.event_type);

  res.status(200).json({});
};
