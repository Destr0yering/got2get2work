import type { FastifyInstance } from "fastify";

import {
  AcceptAgreementBodySchema,
  AgreementAcceptanceSchema,
  CaptainAttestationBodySchema,
  CaptainEligibilitySchema,
  ErrorEnvelopeSchema,
  RequiredAgreementsSchema,
  type CaptainAttestationBody,
} from "../../../../../packages/contracts/src";
import { createAuthGuards } from "../membership/auth";
import type { FirebaseTokenVerifier } from "../membership/ports";
import type { MembershipService } from "../membership/service";
import type { AgreementService } from "./service";

export interface AgreementRouteDependencies {
  verifier: FirebaseTokenVerifier;
  memberships: MembershipService;
  agreements: AgreementService;
}

export async function registerAgreementRoutes(app: FastifyInstance, dependencies: AgreementRouteDependencies) {
  const guards = createAuthGuards(dependencies.verifier, dependencies.memberships);

  app.get<{ Querystring: { captain?: boolean } }>("/v1/agreements/required", {
    preHandler: guards.requireActiveMembership,
    schema: {
      tags: ["agreements"],
      querystring: { type: "object", properties: { captain: { type: "boolean" } }, additionalProperties: false },
      response: { 200: RequiredAgreementsSchema, 401: ErrorEnvelopeSchema, 403: ErrorEnvelopeSchema },
    },
  }, async (request) => ({ agreements: await dependencies.agreements.required(request.identity!, request.query.captain === true) }));

  app.post<{ Params: { id: string }; Body: { acknowledged: true } }>("/v1/agreements/:id/accept", {
    preHandler: guards.requireActiveMembership,
    schema: {
      tags: ["agreements"],
      params: { type: "object", required: ["id"], properties: { id: { type: "string", minLength: 1, maxLength: 128 } } },
      body: AcceptAgreementBodySchema,
      response: { 201: AgreementAcceptanceSchema, 400: ErrorEnvelopeSchema, 401: ErrorEnvelopeSchema, 403: ErrorEnvelopeSchema, 404: ErrorEnvelopeSchema },
    },
  }, async (request, reply) => reply.status(201).send(await dependencies.agreements.accept(request.identity!, request.params.id, {
    appVersion: request.headers["x-app-version"] as string | undefined,
    userAgent: request.headers["user-agent"],
  })));

  app.put<{ Body: CaptainAttestationBody }>("/v1/captain/attestation", {
    preHandler: guards.requireActiveMembership,
    schema: {
      tags: ["captain"],
      body: CaptainAttestationBodySchema,
      response: { 200: CaptainEligibilitySchema, 400: ErrorEnvelopeSchema, 401: ErrorEnvelopeSchema, 403: ErrorEnvelopeSchema },
    },
  }, async (request) => dependencies.agreements.attest(request.identity!, request.body));

  app.get("/v1/captain/eligibility", {
    preHandler: guards.requireActiveMembership,
    schema: {
      tags: ["captain"],
      response: { 200: CaptainEligibilitySchema, 401: ErrorEnvelopeSchema, 403: ErrorEnvelopeSchema },
    },
  }, async (request) => dependencies.agreements.eligibility(request.identity!));
}
