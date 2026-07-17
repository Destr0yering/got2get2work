import React, { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { AppScreen, BackButton, Button, Card, PageHeader, Pill, SectionTitle } from "../../components/primitives";
import { useApp } from "../../state/AppContext";
import { colors, radius } from "../../theme/tokens";

export function PrivacyScreen() {
  const { state, dispatch } = useApp();
  const [accepted, setAccepted] = useState(false);
  const policiesReviewed = state.termsReviewed && state.privacyReviewed;
  return (
    <AppScreen>
      <BackButton label="Welcome" onPress={() => dispatch({ type: "NAVIGATE", route: "welcome" })} />
      <PageHeader eyebrow="Privacy first" title="Review the policies, then choose optional access" subtitle="Policy acceptance is required for the demo profile. Schedule and notification preferences are separate, optional, and off by default." />
      <Card tone="green">
        <Pill label="Location approach" tone="green" />
        <Text style={styles.promiseTitle}>The MVP does not ask for an exact home address.</Text>
        <Text style={styles.body}>Use nearby cross streets or a general pickup area. That entry is still location information and is held in local demo state. Seeded match cards use broader area labels; a public meeting point appears after both demo coworkers agree.</Text>
      </Card>
      <SectionTitle title="Required policies" detail="Open and review both documents before checking the acceptance box." />
      <View style={styles.policyButtons}>
        <Button label={state.termsReviewed ? "MVP Terms reviewed · open again" : "Open MVP Terms"} variant="secondary" onPress={() => dispatch({ type: "REVIEW_POLICY", kind: "terms" })} />
        <Button label={state.privacyReviewed ? "Privacy Notice reviewed · open again" : "Open MVP Privacy Notice"} variant="secondary" onPress={() => dispatch({ type: "REVIEW_POLICY", kind: "privacy" })} />
      </View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted, disabled: !policiesReviewed }}
        disabled={!policiesReviewed}
        onPress={() => setAccepted((value) => !value)}
        style={({ pressed }) => [styles.checkboxRow, pressed && styles.pressed]}
      >
        <View style={[styles.checkbox, accepted && styles.checkboxOn]}><Text style={styles.checkText}>{accepted ? "✓" : ""}</Text></View>
        <View style={styles.flex}>
          <Text style={styles.rowTitle}>I have reviewed and accept the MVP Terms and Privacy Notice</Text>
          <Text style={styles.rowDetail}>{policiesReviewed ? "Required for this hackathon demo profile. Optional access below is not part of this acceptance." : "Open both policy documents above before accepting."}</Text>
        </View>
      </Pressable>
      <SectionTitle title="Optional permissions" detail="These choices are not required to accept the policies and can be changed later." />
      <Card tone="amber"><Text style={styles.rowTitle}>Pickup proximity is requested later</Text><Text style={styles.body}>A Bluetooth handoff choice appears only after a ride is confirmed. It is separate for each coworker, foreground-only, and off by default.</Text></Card>
      <PermissionRow
        label="Schedule connection preference"
        detail="Optional · simulated read-only connection in this prototype"
        value={state.schedulePermission}
        onValueChange={(schedulePermission) => dispatch({ type: "UPDATE_PERMISSIONS", schedulePermission, notificationPermission: state.notificationPermission })}
      />
      <PermissionRow
        label="Commute notification preference"
        detail="Optional · preference only; this prototype does not send OS push notifications"
        value={state.notificationPermission}
        onValueChange={(notificationPermission) => dispatch({ type: "UPDATE_PERMISSIONS", schedulePermission: state.schedulePermission, notificationPermission })}
      />
      <Card tone="blue">
        <Text style={styles.rowTitle}>AI data boundary</Text>
        <Text style={styles.body}>In the offline demo, schedule prose stays in the app and is structured locally. If the optional live service is enabled later, its server builds a new OpenAI request from allowlisted shift fields; raw prose and profile-area values are not forwarded. Common personal and location patterns are also rejected early. Do not paste personal or location data. Match explanations receive allowlisted facts only.</Text>
      </Card>
      <Button
        label="Accept policies and continue"
        disabled={!accepted || !policiesReviewed}
        onPress={() => dispatch({ type: "SET_CONSENT", acceptedTerms: accepted, schedulePermission: state.schedulePermission, notificationPermission: state.notificationPermission })}
      />
    </AppScreen>
  );
}

function PermissionRow({ label, detail, value, onValueChange }: { label: string; detail: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.permissionRow}>
      <View style={styles.flex}><Text style={styles.rowTitle}>{label}</Text><Text style={styles.rowDetail}>{detail}</Text></View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#C8D0D9", true: "#73C8AD" }}
        thumbColor={value ? colors.kind : colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  promiseTitle: { color: colors.ink, fontSize: 19, fontWeight: "900", marginTop: 10 },
  body: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 5 },
  checkboxRow: { flexDirection: "row", gap: 12, alignItems: "center", minHeight: 74, padding: 13, marginBottom: 10, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface },
  checkbox: { width: 28, height: 28, borderRadius: 8, borderWidth: 2, borderColor: colors.borderStrong, alignItems: "center", justifyContent: "center" },
  checkboxOn: { backgroundColor: colors.cobalt, borderColor: colors.cobalt },
  checkText: { color: colors.white, fontWeight: "900" },
  permissionRow: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 78, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 11 },
  flex: { flex: 1 },
  rowTitle: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  rowDetail: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  pressed: { opacity: 0.75 },
  policyButtons: { marginBottom: 8 }
});
