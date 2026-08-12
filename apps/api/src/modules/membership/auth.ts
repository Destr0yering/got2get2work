import type { FastifyReply, FastifyRequest } from "fastify";

import type { AuthenticatedUser, RequestIdentity } from "./domain";
import { MembershipError } from "./domain";
import type { FirebaseTokenVerifier } from "./ports";
import type { MembershipService } from "./service";

declare module "fastify" {
  interface FastifyRequest {
    authenticatedUser?: AuthenticatedUser;
    identity?: RequestIdentity;
  }
}
function bearer(request: FastifyRequest): string {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    throw new MembershipError("Sign in is required.", "AUTH_REQUIRED", 401);
  }
  const token = authorization.slice(7).trim();
  if (!token) throw new MembershipError("Sign in is required.", "AUTH_REQUIRED", 401);
  return token;
}

export function createAuthGuards(verifier: FirebaseTokenVerifier, memberships: MembershipService) {
  const authenticateUser = async (request: FastifyRequest, _reply: FastifyReply) => {
    let decoded;
    try {
      decoded = await verifier.verifyIdToken(bearer(request), true);
    } catch (error) {
      if (error instanceof MembershipError) throw error;
      throw new MembershipError("Your session is invalid or expired.", "INVALID_SESSION", 401);
    }
    request.authenticatedUser = {
      uid: decoded.uid,
      email: decoded.email ?? null,
      emailVerified: decoded.email_verified === true,
    };
  };

  const requireActiveMembership = async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticateUser(request, reply);
    request.identity = await memberships.identityFor(request.authenticatedUser!);
  };

  const requireRole = (...roles: RequestIdentity["role"][]) => async (request: FastifyRequest, reply: FastifyReply) => {
    await requireActiveMembership(request, reply);
    memberships.requireRole(request.identity!, ...roles);
  };

  return { authenticateUser, requireActiveMembership, requireRole };
}
