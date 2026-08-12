import { randomUUID } from "node:crypto";

import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify, { type FastifyInstance } from "fastify";

import {
  ErrorEnvelopeSchema,
  LiveHealthSchema,
  PublicConfigSchema,
  ReadyHealthSchema,
  type ErrorEnvelope,
} from "../../../packages/contracts/src";
import { loadApiConfig, type ApiConfig } from "./config";

export interface BuildApiOptions {
  config?: ApiConfig;
  logger?: boolean;
  now?: () => Date;
}
const securityHeaders = {
  "cache-control": "no-store",
  "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
  "permissions-policy": "camera=(), geolocation=(), microphone=()",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
};

export async function buildApi(options: BuildApiOptions = {}): Promise<FastifyInstance> {
  const config = options.config ?? loadApiConfig();
  const now = options.now ?? (() => new Date());
  const app = Fastify({
    logger: options.logger ?? true,
    requestIdHeader: "x-correlation-id",
    genReqId: () => randomUUID(),
    bodyLimit: 20_000,
    trustProxy: 1,
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "Got2Get2Work API",
        description: "Versioned API for the Got2Get2Work workforce carpool pilot.",
        version: "1.0.0",
      },
      servers: [{ url: "/" }],
      tags: [{ name: "system", description: "Service health and public bootstrap metadata." }],
    },
  });

  if (config.exposeDocumentation) {
    await app.register(swaggerUi, { routePrefix: "/documentation" });
  }

  app.addHook("onSend", async (_request, reply, payload) => {
    for (const [name, value] of Object.entries(securityHeaders)) reply.header(name, value);
    return payload;
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error, correlationId: request.id }, "request_failed");
    const envelope: ErrorEnvelope = {
      error: {
        code: "INTERNAL_ERROR",
        message: "The request could not be completed.",
        correlationId: request.id,
        retryable: false,
      },
    };
    return reply.status(500).send(envelope);
  });

  app.get("/health/live", {
    schema: {
      tags: ["system"],
      response: { 200: LiveHealthSchema, 500: ErrorEnvelopeSchema },
    },
  }, async () => ({
    ok: true as const,
    service: "got2get2work-api" as const,
    release: config.release,
    timestamp: now().toISOString(),
  }));

  app.get("/health/ready", {
    schema: {
      tags: ["system"],
      response: { 200: ReadyHealthSchema, 500: ErrorEnvelopeSchema },
    },
  }, async () => ({
    ok: true,
    service: "got2get2work-api" as const,
    release: config.release,
    timestamp: now().toISOString(),
    checks: { configuration: config.firebase.projectId ? "ready" as const : "degraded" as const },
  }));

  app.get("/v1/config", {
    schema: {
      tags: ["system"],
      response: { 200: PublicConfigSchema, 500: ErrorEnvelopeSchema },
    },
  }, async () => ({ environment: config.environment, firebase: config.firebase }));

  return app;
}
