import type { FastifyInstance } from "fastify";

import {
  ErrorEnvelopeSchema,
  CreateReferralBodySchema,
  CreatedReferralSchema,
  MembershipDecisionBodySchema,
  MembershipListSchema,
  MembershipSchema,
  MembershipStatusSchema,
  RedeemReferralBodySchema,
  type MembershipDecisionBody,
  type CreateReferralBody,
  type MembershipStatus,
  type RedeemReferralBody,
} from "../../../../../packages/contracts/src";
import type { FirebaseTokenVerifier } from "./ports";
import { createAuthGuards } from "./auth";
import type { MembershipService } from "./service";

export interface MembershipRouteDependencies {
  verifier: FirebaseTokenVerifier;
  service: MembershipService;
}

export async function registerMembershipRoutes(app: FastifyInstance, dependencies: MembershipRouteDependencies) {
  const guards = createAuthGuards(dependencies.verifier, dependencies.service);

  app.post<{ Body: CreateReferralBody }>("/v1/admin/referral-codes", {
    preHandler: guards.requireRole("employer_admin"),
    schema: {
      tags: ["employer-admin"],
      body: CreateReferralBodySchema,
      response: { 201: CreatedReferralSchema, 400: ErrorEnvelopeSchema, 401: ErrorEnvelopeSchema, 403: ErrorEnvelopeSchema },
    },
  }, async (request, reply) => reply.status(201).send(
    await dependencies.service.createReferral(request.identity!, request.body.expiresAt, request.body.maxUses),
  ));

  app.post<{ Body: RedeemReferralBody }>("/v1/memberships/referrals:redeem", {
    preHandler: guards.authenticateUser,
    schema: {
      tags: ["membership"],
      body: RedeemReferralBodySchema,
      response: { 201: MembershipSchema, 400: ErrorEnvelopeSchema, 401: ErrorEnvelopeSchema, 403: ErrorEnvelopeSchema },
    },
  }, async (request, reply) => reply.status(201).send(
    await dependencies.service.redeem(request.body.code, request.authenticatedUser!),
  ));

  app.get("/v1/memberships/current", {
    preHandler: guards.requireActiveMembership,
    schema: {
      tags: ["membership"],
      response: { 200: MembershipSchema, 401: ErrorEnvelopeSchema, 403: ErrorEnvelopeSchema },
    },
  }, async (request) => {
    return dependencies.service.current(request.identity!);
  });

  app.get<{ Querystring: { status?: MembershipStatus } }>("/v1/admin/memberships", {
    preHandler: guards.requireRole("employer_admin"),
    schema: {
      tags: ["employer-admin"],
      querystring: {
        type: "object",
        properties: { status: MembershipStatusSchema },
        additionalProperties: false,
      },
      response: { 200: MembershipListSchema, 401: ErrorEnvelopeSchema, 403: ErrorEnvelopeSchema },
    },
  }, async (request) => ({
    memberships: await dependencies.service.listPending(request.identity!, request.query.status ?? "pending_approval"),
  }));

  app.post<{ Params: { id: string }; Body: MembershipDecisionBody }>("/v1/admin/memberships/:id/approve", {
    preHandler: guards.requireRole("employer_admin"),
    schema: {
      tags: ["employer-admin"],
      params: { type: "object", required: ["id"], properties: { id: { type: "string", minLength: 1, maxLength: 128 } } },
      body: MembershipDecisionBodySchema,
      response: { 200: MembershipSchema, 400: ErrorEnvelopeSchema, 401: ErrorEnvelopeSchema, 403: ErrorEnvelopeSchema, 404: ErrorEnvelopeSchema, 409: ErrorEnvelopeSchema },
    },
  }, async (request) => dependencies.service.decide(
    request.identity!, request.params.id, "active", request.body.reason,
  ));

  app.post<{ Params: { id: string }; Body: MembershipDecisionBody }>("/v1/admin/memberships/:id/reject", {
    preHandler: guards.requireRole("employer_admin"),
    schema: {
      tags: ["employer-admin"],
      params: { type: "object", required: ["id"], properties: { id: { type: "string", minLength: 1, maxLength: 128 } } },
      body: MembershipDecisionBodySchema,
      response: { 200: MembershipSchema, 400: ErrorEnvelopeSchema, 401: ErrorEnvelopeSchema, 403: ErrorEnvelopeSchema, 404: ErrorEnvelopeSchema, 409: ErrorEnvelopeSchema },
    },
  }, async (request) => dependencies.service.decide(
    request.identity!, request.params.id, "rejected", request.body.reason,
  ));
}
