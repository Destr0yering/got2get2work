import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen, BackButton, Button, Card, PageHeader, Pill, SectionTitle } from "../../components/primitives";
import { calculatePilotEconomics } from "../../domain/benefit";
import { productionApi } from "../../services/ProductionApi";
import { useApp } from "../../state/AppContext";
import { colors } from "../../theme/tokens";

const localBrief = "Keep the pilot focused on the 7:00 AM shift, where protected-shift volume is strongest. Ask the site lead to recruit additional opted-in backup drivers before expanding subsidies.";

export function EmployerDashboardScreen() {
  const { state, dispatch } = useApp();
  const [brief, setBrief] = useState(localBrief);
  const [source, setSource] = useState<"fallback" | "gemini">("fallback");
  const [execution, setExecution] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const metrics = state.pilotMetrics;
  const economics = calculatePilotEconomics(metrics);

  async function refreshBrief() {
    setBusy(true);
    try {
      const result = await productionApi.createSiteCoordinatorBrief(metrics);
      setBrief(result.recommendation);
      setSource(result.source === "gemini" ? "gemini" : "fallback");
      setExecution(result.execution ? `${result.execution.decisionId} · ${result.execution.generatedAt}` : null);
    } catch {
      setBrief(localBrief);
      setSource("fallback");
      setExecution(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppScreen wide testID="employer-dashboard">
      <BackButton label="Back to employee app" onPress={() => dispatch({ type: "SET_TAB", tab: "profile" })} />
      <PageHeader eyebrow="Northstar Fulfillment · North Campus" title="Shift Protection pilot" subtitle="A privacy-safe, aggregate view for benefits and site leaders." />
      <Card tone="amber">
        <Pill label="Fictional pilot · demo estimates" tone="amber" />
        <Text style={styles.cardBody}>These are seeded assumptions for the XPRIZE product demonstration—not measured customer results, audited savings, or a transportation guarantee.</Text>
      </Card>
      <View style={styles.grid}>
        <Metric value={String(metrics.enrolledEmployees)} label={`enrolled of ${metrics.eligibleEmployees} eligible`} />
        <Metric value={String(metrics.activeCarpools)} label="active carpools" />
        <Metric value={String(metrics.protectedShifts)} label="protected shifts" />
        <Metric value={`${Math.round(economics.recoveryRate * 100)}%`} label="successful recoveries" />
      </View>
      <SectionTitle title="Illustrative monthly economics" detail="Every value is traceable to an aggregate input." />
      <Card>
        <Row label="Estimated value of avoided absences" value={`$${economics.estimatedEmployerValue.toLocaleString()}`} />
        <Row label="Platform fee" value={`−$${metrics.monthlyPlatformFee.toLocaleString()}`} />
        <Row label="Employer-funded ride credits" value={`−$${metrics.monthlySubsidyBudget.toLocaleString()}`} />
        <Row label="Estimated net pilot value" value={`$${economics.estimatedNetValue.toLocaleString()}`} strong last />
        <Text style={styles.formula}>{metrics.estimatedAvoidedAbsences} estimated avoided absences × ${metrics.valuePerAvoidedAbsence} assumed value − ${economics.estimatedPilotCost.toLocaleString()} pilot cost.</Text>
      </Card>
      <SectionTitle title="Gemini site coordinator" detail="Gemini receives only the aggregate metrics shown above. It cannot contact employees or spend funds." />
      <Card tone="blue">
        <Pill label={source === "gemini" ? "Live Gemini brief" : "Deterministic fallback"} tone={source === "gemini" ? "green" : "blue"} />
        <Text style={styles.brief}>{brief}</Text>
        {execution ? <Text style={styles.execution}>Audit reference: {execution}</Text> : null}
        <Button label="Refresh aggregate site brief" busy={busy} onPress={refreshBrief} />
      </Card>
      <Card tone="green">
        <Text style={styles.cardTitle}>Employer privacy promise</Text>
        <Text style={styles.cardBody}>No employee names, exact locations, home addresses, ride messages, or individual attendance records are included in this view or its Gemini request.</Text>
      </Card>
    </AppScreen>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return <Card style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></Card>;
}

function Row({ label, value, strong = false, last = false }: { label: string; value: string; strong?: boolean; last?: boolean }) {
  return <View style={[styles.row, last && styles.last]}><Text style={[styles.rowLabel, strong && styles.strong]}>{label}</Text><Text style={[styles.rowValue, strong && styles.strong]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metric: { minWidth: 145, flex: 1 },
  metricValue: { color: colors.cobaltDark, fontSize: 28, fontWeight: "900" },
  metricLabel: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 12 },
  last: { borderBottomWidth: 0 },
  rowLabel: { color: colors.muted, fontSize: 13, flex: 1 },
  rowValue: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  strong: { color: colors.ink, fontWeight: "900" },
  formula: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 12 },
  cardTitle: { color: colors.ink, fontSize: 16, fontWeight: "900" },
  cardBody: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 7 },
  brief: { color: colors.ink, fontSize: 16, lineHeight: 24, fontWeight: "700", marginTop: 14 },
  execution: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 10 }
});
