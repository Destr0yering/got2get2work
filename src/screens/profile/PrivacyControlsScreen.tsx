import React from "react";
import { Alert, Platform, Share, StyleSheet, Switch, Text, View } from "react-native";

import { AppScreen, BackButton, Button, Card, PageHeader, Pill, SectionTitle } from "../../components/primitives";
import { useApp } from "../../state/AppContext";
import { colors } from "../../theme/tokens";
import { useAuth } from "../../auth/AuthContext";
import { productionApi } from "../../services/ProductionApi";

export function PrivacyControlsScreen() {
  const { state, dispatch } = useApp();
  const { user, signOutUser } = useAuth();
  function update(schedulePermission = state.schedulePermission, notificationPermission = state.notificationPermission) {
    dispatch({ type: "UPDATE_PERMISSIONS", schedulePermission, notificationPermission });
  }
  async function exportData() {
    try {
      const data = await productionApi.exportAccount();
      const text = JSON.stringify(data, null, 2);
      if (Platform.OS === "web" && typeof document !== "undefined") {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
        link.download = "got2get2work-account-export.json";
        link.click();
        URL.revokeObjectURL(link.href);
      } else {
        await Share.share({ message: text, title: "Got2Get2Work account export" });
      }
      dispatch({ type: "SET_NOTICE", notice: "Your account export was prepared." });
    } catch (reason) {
      dispatch({ type: "SET_NOTICE", notice: reason instanceof Error ? reason.message : "Export failed." });
    }
  }
  async function deleteData() {
    try {
      await productionApi.deleteAccount();
      await signOutUser();
      dispatch({ type: "RESET_DEMO" });
    } catch (reason) {
      dispatch({ type: "SET_NOTICE", notice: reason instanceof Error ? reason.message : "Deletion failed." });
    }
  }
  function confirmDeletion() {
    Alert.alert(
      "Permanently delete account?",
      "This removes your profile, blocks, and employer membership. Safety reports may be retained when legally or operationally required.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete account", style: "destructive", onPress: () => void deleteData() },
      ],
    );
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
      <SectionTitle title="Policies and contact" />
      <Button label="Review MVP Terms" variant="secondary" onPress={() => dispatch({ type: "REVIEW_POLICY", kind: "terms" })} />
      <Button label="Review Privacy Notice" variant="secondary" onPress={() => dispatch({ type: "REVIEW_POLICY", kind: "privacy" })} />
      <Button label="Feedback or report a problem" variant="secondary" onPress={() => dispatch({ type: "NAVIGATE", route: "feedback-help" })} />
      <SectionTitle title="Your account data" detail="These controls operate on authenticated production records, not the seeded demo." />
      <Button label="Download my data" variant="secondary" disabled={!user} onPress={exportData} />
      <Button label="Permanently delete my account" variant="danger" disabled={!user} onPress={confirmDeletion} accessibilityHint="Opens a final confirmation before deletion." />
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
