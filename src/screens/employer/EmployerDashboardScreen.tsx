import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../../auth/AuthContext";
import { AppScreen, BackButton, Button, Card, Field, Notice, PageHeader, Pill, SectionTitle } from "../../components/primitives";
import { calculatePilotEconomics } from "../../domain/benefit";
import { AggregateMetric, CreatedReferral, EmployerDashboard, MembershipView, ProductionApiError, productionApi } from "../../services/ProductionApi";
import { useApp } from "../../state/AppContext";
import { colors } from "../../theme/tokens";

type ConsoleTab = "overview" | "approvals" | "referrals";
type Decision = { membership: MembershipView; action: "approve" | "reject" } | null;
const localBrief = "Keep the pilot focused on the 7:00 AM shift, where protected-shift volume is strongest. Ask the site lead to recruit additional opted-in backup drivers before expanding subsidies.";

export function EmployerDashboardScreen() {
  return process.env.EXPO_PUBLIC_DEMO_MODE === "true" ? <DemoEmployerDashboard /> : <ProductionEmployerConsole />;
}

function ProductionEmployerConsole() {
  const { dispatch } = useApp();
  const { user, signOutUser } = useAuth();
  const [tab, setTab] = useState<ConsoleTab>("overview");
  const [dashboard, setDashboard] = useState<EmployerDashboard | null>(null);
  const [memberships, setMemberships] = useState<MembershipView[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [decision, setDecision] = useState<Decision>(null);
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState(defaultReferralExpiry());
  const [maxUses, setMaxUses] = useState("10");
  const [createdReferral, setCreatedReferral] = useState<CreatedReferral | null>(null);

  useEffect(() => { void refresh(); }, []);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [nextDashboard, pending] = await Promise.all([productionApi.loadAdminDashboard(), productionApi.listAdminMemberships()]);
      setDashboard(nextDashboard);
      setMemberships(pending.memberships);
    } catch (reason) {
      setError(adminErrorMessage(reason));
    } finally {
      setLoading(false);
    }
  }

  async function submitDecision() {
    if (!decision || reason.trim().length < 3) return;
    setBusy(true);
    setError(null);
    try {
      await productionApi.decideAdminMembership(decision.membership.id, decision.action, reason.trim());
      setNotice(decision.action === "approve" ? "Membership approved." : "Membership rejected.");
      setDecision(null);
      setReason("");
      await refresh();
    } catch (reason) {
      setError(adminErrorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  async function createReferral() {
    const uses = Number(maxUses);
    const expiry = new Date(expiresAt);
    if (!Number.isInteger(uses) || uses < 1 || uses > 500 || !Number.isFinite(expiry.getTime())) {
      setError("Enter a valid expiration date and a use limit from 1 to 500.");
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const referral = await productionApi.createAdminReferral(expiry.toISOString(), uses);
      setCreatedReferral(referral);
      setNotice("Referral code created. Copy it now; the plaintext code is returned only once.");
    } catch (reason) {
      setError(adminErrorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await signOutUser();
    dispatch({ type: "NAVIGATE", route: "welcome" });
  }

  return (
    <AppScreen wide testID="employer-dashboard">
      <View style={styles.topRow}>
        <View style={styles.flex}><PageHeader eyebrow="Employer administration" title="Shift Protection console" subtitle={`Privacy-safe pilot administration${user?.email ? ` · ${user.email}` : ""}`} /></View>
        <Button label="Sign out" variant="quiet" onPress={() => void signOut()} />
      </View>
      <Card tone="green"><Text style={styles.cardTitle}>Aggregate outcomes, limited access</Text><Text style={styles.cardBody}>This console never exposes home addresses, location trails, ride messages, schedules, plates, safety narratives, ratings, or individual attendance.</Text></Card>
      {error ? <Notice message={error} tone="red" /> : null}
      {notice ? <Notice message={notice} /> : null}
      <View accessibilityRole="tablist" style={styles.tabs}>
        <Tab label="Overview" active={tab === "overview"} onPress={() => setTab("overview")} />
        <Tab label={`Approvals (${memberships.length})`} active={tab === "approvals"} onPress={() => setTab("approvals")} />
        <Tab label="Referral codes" active={tab === "referrals"} onPress={() => setTab("referrals")} />
      </View>
      {loading ? <Card><Text style={styles.empty}>Loading employer data…</Text></Card> : null}
      {!loading && tab === "overview" ? <Overview dashboard={dashboard} onRetry={() => void refresh()} /> : null}
      {!loading && tab === "approvals" ? <Approvals memberships={memberships} decision={decision} reason={reason} busy={busy} onSelect={setDecision} onReason={setReason} onCancel={() => { setDecision(null); setReason(""); }} onSubmit={() => void submitDecision()} /> : null}
      {!loading && tab === "referrals" ? <Referrals expiresAt={expiresAt} maxUses={maxUses} created={createdReferral} busy={busy} onExpiresAt={setExpiresAt} onMaxUses={setMaxUses} onCreate={() => void createReferral()} /> : null}
    </AppScreen>
  );
}

function Overview({ dashboard, onRetry }: { dashboard: EmployerDashboard | null; onRetry: () => void }) {
  if (!dashboard) return <Card><Text style={styles.empty}>Employer metrics are unavailable.</Text><Button label="Retry" onPress={onRetry} /></Card>;
  const entries: Array<[string, AggregateMetric]> = [
    ["Approved members", dashboard.metrics.approvedMembers], ["Confirmed rides", dashboard.metrics.confirmedRides],
    ["Participant completion responses", dashboard.metrics.participantCompletions], ["Cancellations", dashboard.metrics.cancellations],
    ["Self-reported shifts protected", dashboard.metrics.shiftsProtected],
  ];
  return <><SectionTitle title="Last 30 days" detail={`${formatDate(dashboard.period.from)}–${formatDate(dashboard.period.through)} · Metrics suppress below ${dashboard.minimumCohort} participants.`} /><View style={styles.grid}>{entries.map(([label, metric]) => <Card key={label} style={styles.metric}><Text style={styles.metricValue}>{metric.suppressed || metric.value === null ? "—" : metric.value.toLocaleString()}</Text><Text style={styles.metricLabel}>{label}</Text><Text style={styles.definition}>{metric.suppressed ? `Suppressed until the minimum cohort of ${dashboard.minimumCohort} is reached.` : metric.definition}</Text></Card>)}</View></>;
}

function Approvals({ memberships, decision, reason, busy, onSelect, onReason, onCancel, onSubmit }: { memberships: MembershipView[]; decision: Decision; reason: string; busy: boolean; onSelect: (value: Decision) => void; onReason: (value: string) => void; onCancel: () => void; onSubmit: () => void }) {
  return <><SectionTitle title="Pending membership approvals" detail="Confirm each request against the employer roster before deciding. Referral entry never activates access automatically." />{memberships.length === 0 ? <Card><Text style={styles.empty}>No pending approval requests.</Text></Card> : memberships.map((membership) => <Card key={membership.id}><Pill label="Pending approval" tone="amber" /><Text style={styles.requestTitle}>Approval request {shortId(membership.id)}</Text><Text style={styles.requestMeta}>Submitted {formatDate(membership.submittedAt)} · Worksite-scoped</Text><View style={styles.actions}><Button label="Approve" variant="secondary" disabled={busy} onPress={() => onSelect({ membership, action: "approve" })} /><Button label="Reject" variant="danger" disabled={busy} onPress={() => onSelect({ membership, action: "reject" })} /></View></Card>)}{decision ? <Card tone={decision.action === "approve" ? "blue" : "red"}><Text style={styles.cardTitle}>{decision.action === "approve" ? "Approve" : "Reject"} request {shortId(decision.membership.id)}</Text><Field label="Decision reason" value={reason} onChangeText={onReason} maxLength={500} hint="Required for the audit record; 3–500 characters." /><View style={styles.actions}><Button label="Cancel" variant="secondary" disabled={busy} onPress={onCancel} /><Button label={decision.action === "approve" ? "Confirm approval" : "Confirm rejection"} variant={decision.action === "approve" ? "primary" : "danger"} busy={busy} disabled={reason.trim().length < 3} onPress={onSubmit} /></View></Card> : null}</>;
}

function Referrals({ expiresAt, maxUses, created, busy, onExpiresAt, onMaxUses, onCreate }: { expiresAt: string; maxUses: string; created: CreatedReferral | null; busy: boolean; onExpiresAt: (value: string) => void; onMaxUses: (value: string) => void; onCreate: () => void }) {
  return <><SectionTitle title="Create a beta referral code" detail="Codes are worksite-scoped, hashed at rest, usage-limited, expirable, and still require administrator approval." /><Card><Field label="Expiration" value={expiresAt} onChangeText={onExpiresAt} placeholder="YYYY-MM-DD" autoCapitalize="none" hint="Up to 90 days from today." /><Field label="Maximum uses" value={maxUses} onChangeText={onMaxUses} keyboardType="number-pad" hint="Choose 1–500 invited signups." /><Button label="Create referral code" busy={busy} onPress={onCreate} /></Card>{created ? <Card tone="amber"><Pill label="Shown once" tone="amber" /><Text selectable style={styles.code}>{created.code}</Text><Text style={styles.cardBody}>Copy and distribute this code through an approved employer channel. Got2Get2Work stores only its digest and cannot display the plaintext again.</Text><Text style={styles.requestMeta}>Expires {formatDate(created.expiresAt)} · Maximum {created.maxUses} uses</Text></Card> : null}</>;
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={onPress} style={({ pressed }) => [styles.tab, active && styles.tabActive, pressed && styles.pressed]}><Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text></Pressable>; }

function DemoEmployerDashboard() {
  const { state, dispatch } = useApp();
  const [brief, setBrief] = useState(localBrief); const [busy, setBusy] = useState(false);
  const metrics = state.pilotMetrics; const economics = calculatePilotEconomics(metrics);
  async function refreshBrief() { setBusy(true); try { setBrief((await productionApi.createSiteCoordinatorBrief(metrics)).recommendation); } catch { setBrief(localBrief); } finally { setBusy(false); } }
  return <AppScreen wide testID="employer-dashboard"><BackButton label="Back to employee app" onPress={() => dispatch({ type: "SET_TAB", tab: "profile" })} /><PageHeader eyebrow="Northstar Fulfillment · North Campus" title="Shift Protection pilot" subtitle="A privacy-safe, aggregate view for benefits and site leaders." /><Card tone="amber"><Pill label="Fictional pilot · demo estimates" tone="amber" /><Text style={styles.cardBody}>Seeded demonstration assumptions—not measured customer results, audited savings, or a transportation guarantee.</Text></Card><View style={styles.grid}><DemoMetric value={String(metrics.enrolledEmployees)} label={`enrolled of ${metrics.eligibleEmployees} eligible`} /><DemoMetric value={String(metrics.activeCarpools)} label="active carpools" /><DemoMetric value={String(metrics.protectedShifts)} label="protected shifts" /><DemoMetric value={`${Math.round(economics.recoveryRate * 100)}%`} label="successful recoveries" /></View><SectionTitle title="Gemini site coordinator" detail="Only the aggregate metrics shown above are sent." /><Card tone="blue"><Text style={styles.brief}>{brief}</Text><Button label="Refresh aggregate site brief" busy={busy} onPress={() => void refreshBrief()} /></Card></AppScreen>;
}

function DemoMetric({ value, label }: { value: string; label: string }) { return <Card style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></Card>; }
function shortId(value: string) { return value.length <= 8 ? value : `${value.slice(0, 8)}…`; }
function formatDate(value: string) { const date = new Date(value); return Number.isFinite(date.getTime()) ? date.toLocaleDateString() : "Unknown date"; }
function defaultReferralExpiry() { const date = new Date(Date.now() + 7 * 86_400_000); return date.toISOString().slice(0, 10); }
function adminErrorMessage(reason: unknown) { if (reason instanceof ProductionApiError && reason.code === "MFA_REQUIRED") return "A verified second factor is required before this administrative action."; if (reason instanceof ProductionApiError && reason.code === "RECENT_AUTH_REQUIRED") return "Sign out and sign in again, then retry this administrative action within 15 minutes."; return reason instanceof Error ? reason.message : "The employer request could not be completed."; }

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 16 }, flex: { flex: 1, minWidth: 280 }, tabs: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 16 }, tab: { minHeight: 44, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.borderStrong, justifyContent: "center", backgroundColor: colors.surface }, tabActive: { backgroundColor: colors.cobalt, borderColor: colors.cobalt }, tabText: { color: colors.ink, fontWeight: "800" }, tabTextActive: { color: colors.white }, pressed: { opacity: 0.72 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, metric: { minWidth: 190, flex: 1 }, metricValue: { color: colors.cobaltDark, fontSize: 28, fontWeight: "900" }, metricLabel: { color: colors.ink, fontSize: 13, fontWeight: "800", marginTop: 5 }, definition: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 8 }, cardTitle: { color: colors.ink, fontSize: 16, fontWeight: "900" }, cardBody: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 7 }, empty: { color: colors.muted, fontSize: 14, textAlign: "center", paddingVertical: 12 }, requestTitle: { color: colors.ink, fontSize: 16, fontWeight: "900", marginTop: 12 }, requestMeta: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 5 }, actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }, code: { color: colors.ink, fontSize: 20, fontWeight: "900", letterSpacing: 0.8, marginTop: 16 }, brief: { color: colors.ink, fontSize: 16, lineHeight: 24, fontWeight: "700", marginBottom: 8 },
});
