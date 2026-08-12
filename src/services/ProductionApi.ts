import { firebaseAuth } from "./firebase";

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
