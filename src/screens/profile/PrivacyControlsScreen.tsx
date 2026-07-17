import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { AppScreen, BackButton, Button, Card, PageHeader, Pill, SectionTitle } from "../../components/primitives";
import { useApp } from "../../state/AppContext";
import { colors } from "../../theme/tokens";

export function PrivacyControlsScreen() {
  const { state, dispatch } = useApp();
  function update(schedulePermission = state.schedulePermission, notificationPermission = state.notificationPermission) {
    dispatch({ type: "UPDATE_PERMISSIONS", schedulePermission, notificationPermission });
  }
  return (
    <AppScreen>
      <BackButton label="Profile" onPress={() => dispatch({ type: "SET_TAB", tab: "profile" })} />
      <PageHeader eyebrow="Privacy controls" title="You stay in control" subtitle="Disconnect optional access or reset the local prototype at any time." />
      <Card tone="green"><Pill label="Location promise" tone="green" /><Text style={styles.title}>No home address collected</Text><Text style={styles.body}>The local prototype stores the cross-street label you enter. Seeded recommendations use fictional broader-area facts; the saved profile area is excluded from optional AI requests.</Text></Card>
      <SectionTitle title="Optional permissions" />
      <Permission label="Read-only schedule preference" detail="Simulated only; no external scheduler is connected" value={state.schedulePermission} onChange={(value) => update(value)} />
      <Permission label="Commute notifications" detail="Match updates and day-of-ride reminders" value={state.notificationPermission} onChange={(value) => update(state.schedulePermission, value)} />
      <Card tone="amber"><Text style={styles.title}>Pickup proximity is contextual</Text><Text style={styles.body}>Bluetooth handoff stays off until a ride is confirmed. Each coworker opts in separately from the pickup screen, and either can stop sharing for that ride.</Text></Card>
      <Card tone="blue"><Text style={styles.title}>Progressive disclosure</Text><Text style={styles.body}>Approximate area before matching → first name and worksite after recommendation → meeting point and vehicle only after mutual acceptance.</Text></Card>
      <Button label="Reset all local demo data" variant="danger" onPress={() => dispatch({ type: "RESET_DEMO" })} />
    </AppScreen>
  );
}

function Permission({ label, detail, value, onChange }: { label: string; detail: string; value: boolean; onChange: (value: boolean) => void }) { return <View style={styles.permission}><View style={styles.flex}><Text style={styles.permissionLabel}>{label}</Text><Text style={styles.permissionDetail}>{detail}</Text></View><Switch accessibilityLabel={label} value={value} onValueChange={onChange} trackColor={{ false: "#C8D0D9", true: "#73C8AD" }} thumbColor={value ? colors.kind : colors.white} /></View>; }
const styles = StyleSheet.create({
  title: { color: colors.ink, fontSize: 17, fontWeight: "900", marginTop: 10 }, body: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  permission: { minHeight: 76, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  flex: { flex: 1 }, permissionLabel: { color: colors.ink, fontSize: 14, fontWeight: "800" }, permissionDetail: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3 }
});
