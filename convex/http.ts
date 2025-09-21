import { httpRouter } from "convex/server";
import { strikeWebhook } from "./strikeWebhook";

const http = httpRouter();

// Strike webhook endpoint for payment notifications
http.route({
  path: "/webhooks/strike",
  method: "POST",
  handler: strikeWebhook,
});

export default http;
