import { firebaseAuth } from "./firebase";

export type MembershipRole = "worker" | "employer_admin" | "moderator" | "operator";
export type MembershipStatus = "pending_approval" | "active" | "rejected" | "suspended" | "expired" | "withdrawn";

export interface MembershipView {
  id: string;
  uid: string;
  tenantId: string;
  worksiteId: string;
  role: MembershipRole;
  status: MembershipStatus;
  submittedAt: string;
  decidedAt?: string;
}

export interface CreatedReferral {
  id: string;
  code: string;
  tenantId: string;
  worksiteId: string;
  expiresAt: string;
  maxUses: number;
}

export interface AggregateMetric {
  value: number | null;
  denominator: number;
  definition: string;
  suppressed: boolean;
}

export interface EmployerDashboard {
  period: { from: string; through: string };
  minimumCohort: number;
  metrics: Record<"approvedMembers" | "confirmedRides" | "participantCompletions" | "cancellations" | "shiftsProtected", AggregateMetric>;
}

export class ProductionApiError extends Error {
  constructor(message: string, readonly code: string, readonly status: number, readonly correlationId?: string) {
    super(message);
    this.name = "ProductionApiError";
  }
}

function apiUrl(path: string) {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "");
  return baseUrl ? `${baseUrl}${path}` : path;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const user = firebaseAuth().currentUser;
  if (!user) throw new Error("Sign in to use this feature.");
  const token = await user.getIdToken();
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "The request could not be completed.");
  return result as T;
}

export function adminApiConfigured() {
  return Boolean(process.env.EXPO_PUBLIC_ADMIN_API_BASE_URL?.trim());
}

function adminApiUrl(path: string) {
  const baseUrl = process.env.EXPO_PUBLIC_ADMIN_API_BASE_URL?.trim().replace(/\/$/, "");
  if (!baseUrl) throw new ProductionApiError("The employer console API is not configured.", "ADMIN_API_NOT_CONFIGURED", 503);
  return `${baseUrl}${path}`;
}

export function parseProductionApiError(status: number, payload: unknown): ProductionApiError {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = (payload as { error?: unknown }).error;
    if (error && typeof error === "object") {
      const value = error as { code?: unknown; message?: unknown; correlationId?: unknown };
      if (typeof value.code === "string" && typeof value.message === "string") {
        return new ProductionApiError(value.message, value.code, status, typeof value.correlationId === "string" ? value.correlationId : undefined);
      }
    }
  }
  return new ProductionApiError("The request could not be completed.", "REQUEST_FAILED", status);
}

async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const user = firebaseAuth().currentUser;
  if (!user) throw new ProductionApiError("Sign in to use the employer console.", "AUTH_REQUIRED", 401);
  const token = await user.getIdToken();
  let response: Response;
  try {
    response = await fetch(adminApiUrl(path), {
      ...init,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers || {}) },
    });
  } catch {
    throw new ProductionApiError("The employer service is unavailable. Try again shortly.", "NETWORK_ERROR", 503);
  }
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) throw parseProductionApiError(response.status, payload);
  return payload as T;
}

export const productionApi = {
  enrollBeta: (inviteCode: string) => request<{ enrolled: true; tenantId: string; role: "employee" }>("/api/beta/enroll", { method: "POST", body: JSON.stringify({ inviteCode }) }),
  saveBetaProfile: (profile: unknown) => request<{ profile: unknown }>("/api/beta/profile", { method: "POST", body: JSON.stringify(profile) }),
  saveBetaSchedule: (shifts: unknown[]) => request<{ shiftsSaved: number }>("/api/beta/schedule", { method: "POST", body: JSON.stringify({ shifts }) }),
  listBetaMatches: () => request<{ matches: BetaMatch[] }>("/api/beta/matches"),
  createBetaRequest: (recipientId: string) => request<{ request: BetaRequest }>("/api/beta/requests", { method: "POST", body: JSON.stringify({ recipientId }) }),
  listBetaRequests: () => request<{ requests: BetaRequest[] }>("/api/beta/requests"),
  acceptBetaRequest: (requestId: string) => request<{ request: BetaRequest }>(`/api/beta/requests/${encodeURIComponent(requestId)}/accept`, { method: "POST" }),
  createSiteCoordinatorBrief: (metrics: unknown) =>
    request<{
      source: "gemini" | "fallback";
      model: string | null;
      recommendation: string;
      recommendationCode?: string;
      factIds: string[];
      execution?: { decisionId: string; generatedAt: string; humanApprovalRequired: true };
    }>("/api/agent/site-coordinator", { method: "POST", body: JSON.stringify({ metrics }) }),
  loadState: () => request<{ state: unknown }>("/api/account/state"),
  saveState: (state: unknown) => request<{ saved: boolean }>("/api/account/state", { method: "POST", body: JSON.stringify({ state }) }),
  recordConsent: (kind: string, granted: boolean, policyVersion = "2026-07-23") =>
    request("/api/account/consents", { method: "POST", body: JSON.stringify({ kind, granted, policyVersion }) }),
  reportSafety: (category: string, description: string, reportedUserId?: string) =>
    request<{ id: string; status: string }>("/api/safety/reports", { method: "POST", body: JSON.stringify({ category, description, reportedUserId }) }),
  blockUser: (blockedUserId: string) =>
    request("/api/safety/blocks", { method: "POST", body: JSON.stringify({ blockedUserId }) }),
  exportAccount: () => request<Record<string, unknown>>("/api/account/export"),
  deleteAccount: () => request<{ deleted: boolean }>("/api/account", { method: "DELETE", body: JSON.stringify({ confirmation: "DELETE" }) }),
  currentAdminMembership: () => adminRequest<MembershipView>("/v1/memberships/current"),
  listAdminMemberships: (status: MembershipStatus = "pending_approval") => adminRequest<{ memberships: MembershipView[] }>(`/v1/admin/memberships?status=${encodeURIComponent(status)}`),
  createAdminReferral: (expiresAt: string, maxUses: number) => adminRequest<CreatedReferral>("/v1/admin/referral-codes", { method: "POST", body: JSON.stringify({ expiresAt, maxUses }) }),
  decideAdminMembership: (id: string, decision: "approve" | "reject", reason: string) => adminRequest<MembershipView>(`/v1/admin/memberships/${encodeURIComponent(id)}/${decision}`, { method: "POST", body: JSON.stringify({ reason }) }),
  loadAdminDashboard: () => adminRequest<EmployerDashboard>("/v1/admin/dashboard"),
};

export interface BetaMatch {
  userId: string;
  displayName: string;
  areaLabel: string;
  sharedDays: string[];
  toWorkCompatible: boolean;
  homeCompatible: boolean;
  seats: number;
  maxDetourMinutes: number;
  routeStatus: "needs_route_review";
}

export interface BetaRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  recipientId: string;
  recipientName: string;
  sharedDays: string[];
  toWorkCompatible: boolean;
  homeCompatible: boolean;
  status: "pending" | "accepted";
  direction: "incoming" | "outgoing";
}
