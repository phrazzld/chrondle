import { registerOTel } from "@vercel/otel";
import { logger } from "@/lib/logger";

const serviceName = "chrondle";

export async function register(): Promise<void> {
  await registerOTel({
    serviceName,
    attributes: {
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
    },
  });
}

interface RequestContext {
  requestId?: string;
  route?: string;
  host?: string;
}

export const onRequestError = (error: unknown, request: Request, context: RequestContext): void => {
  const errorPayload = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    request: {
      url: request.url,
      method: request instanceof Request ? request.method : "UNKNOWN",
    },
    context,
  };

  logger.error("Unhandled request error", errorPayload);
};
