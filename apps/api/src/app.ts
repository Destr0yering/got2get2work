import { randomUUID } from "node:crypto";

import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";

import {
  ErrorEnvelopeSchema,
  LiveHealthSchema,
  PublicConfigSchema,
  ReadyHealthSchema,
  type ErrorEnvelope,
} from "../../../packages/contracts/src";
import { loadApiConfig, type ApiConfig } from "./config";
import { AgreementError } from "./modules/agreement/domain";
import type { AgreementRouteDependencies } from "./modules/agreement/routes";
import { registerAgreementRoutes } from "./modules/agreement/routes";
import { CommuteError } from "./modules/commute/domain";
import type { CommuteRouteDependencies } from "./modules/commute/routes";
import { registerCommuteRoutes } from "./modules/commute/routes";
import { MembershipError } from "./modules/membership/domain";
import { OperationsError } from "./modules/operations/domain";
import type { OperationsRouteDependencies } from "./modules/operations/routes";
import { registerOperationsRoutes } from "./modules/operations/routes";
import type { MembershipRouteDependencies } from "./modules/membership/routes";
import { registerMembershipRoutes } from "./modules/membership/routes";
import { MatchingError } from "./modules/matching/domain";
import type { MatchingRouteDependencies } from "./modules/matching/routes";
import { registerMatchingRoutes } from "./modules/matching/routes";
import { RideError } from "./modules/ride/domain";
import type { RideRouteDependencies } from "./modules/ride/routes";
import { registerRideRoutes } from "./modules/ride/routes";
import type { ReportingRouteDependencies } from "./modules/reporting/routes";
import { registerReportingRoutes } from "./modules/reporting/routes";
import { TripError } from "./modules/trip/domain";
import type { TripRouteDependencies } from "./modules/trip/routes";
import { registerTripRoutes } from "./modules/trip/routes";
import type { TrustRouteDependencies } from "./modules/trip/trust-routes";
import { registerTrustRoutes } from "./modules/trip/trust-routes";
import { VehicleError } from "./modules/vehicle/domain";
import type { VehicleRouteDependencies } from "./modules/vehicle/routes";
import { registerVehicleRoutes } from "./modules/vehicle/routes";

export interface BuildApiOptions {
  config?: ApiConfig;
  logger?: boolean;
  now?: () => Date;
  membership?: MembershipRouteDependencies;
  agreement?: AgreementRouteDependencies;
  commute?: CommuteRouteDependencies;
  vehicle?: VehicleRouteDependencies;
  matching?: MatchingRouteDependencies;
  ride?: RideRouteDependencies;
  reporting?: ReportingRouteDependencies;
  operations?: OperationsRouteDependencies;
  trip?: TripRouteDependencies;
  trust?: TrustRouteDependencies;
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
    requestIdHeader: false,
    genReqId: () => randomUUID(),
    bodyLimit: 20_000,
    trustProxy: 1,
  });

  await app.register(cors, {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/$/, "");
      callback(null, (config.allowedOrigins ?? []).includes(normalized));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: false,
    maxAge: 600,
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
    if (error instanceof MembershipError || error instanceof AgreementError || error instanceof CommuteError || error instanceof VehicleError || error instanceof MatchingError || error instanceof RideError || error instanceof TripError || error instanceof OperationsError) {
      const envelope: ErrorEnvelope = {
        error: {
          code: error.code,
          message: error.message,
          correlationId: request.id,
          retryable: false,
        },
      };
      return reply.status(error.statusCode).send(envelope);
    }
    if (typeof error === "object" && error !== null && "validation" in error && error.validation) {
      const envelope: ErrorEnvelope = {
        error: {
          code: "INVALID_REQUEST",
          message: "The request did not match the API contract.",
          correlationId: request.id,
          retryable: false,
        },
      };
      return reply.status(400).send(envelope);
    }
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

  if (options.membership) await registerMembershipRoutes(app, options.membership);
  if (options.agreement) await registerAgreementRoutes(app, options.agreement);
  if (options.commute) await registerCommuteRoutes(app, options.commute);
  if (options.vehicle) await registerVehicleRoutes(app, options.vehicle);
  if (options.matching) await registerMatchingRoutes(app, options.matching);
  if (options.ride) await registerRideRoutes(app, options.ride);
  if (options.reporting) await registerReportingRoutes(app, options.reporting);
  if (options.operations) await registerOperationsRoutes(app, options.operations);
  if (options.trip) await registerTripRoutes(app, options.trip);
  if (options.trust) await registerTrustRoutes(app, options.trust);

  return app;
}
