import { Event } from "chargebee-typescript/lib/resources";
import { RouterContext } from "@koa/router";
import {
  activateSubscription,
  cancelSubscription,
  changeSubscription,
} from "./services/tea";

export class HookError extends Error {
  public status: number;
  public metadata: Record<string, unknown>;

  public constructor(
    message: string,
    status: number = 500,
    errorMetadata: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = "HookError";
    this.status = status;
    this.metadata = errorMetadata;
  }
}

const handleEvent = async (event: Event) => {
  switch (event.event_type) {
    case "subscription_activated":
    case "subscription_started":
    case "subscription_reactivated":
    case "subscription_renewed":
    case "subscription_resumed":
      await activateSubscription();
      break;

    case "subscription_changed":
      await changeSubscription();
      break;

    case "subscription_paused":
    case "subscription_deleted":
    case "subscription_cancelled":
      await cancelSubscription();
      break;
    default:
      throw new HookError("Unsupported event", 404);
  }
};

export const hookController = async (ctx: RouterContext) => {
  const event = ctx.request.body as Event;
  const { event_type: eventType, id: eventID } = event;

  console.log("[hookController] Received hookController event", {
    eventID,
    eventType,
  });

  try {
    await handleEvent(event);

    ctx.status = 200;
    ctx.body = {};
  } catch (err) {
    const error = err as HookError;
    console.error("[hookController] Error in hook", {
      eventType,
      errorMessage: error.message,
      errorMetadata: error.metadata,
    });

    ctx.status = error.status;
    ctx.body = { errorMessage: error.message };
  }
};
