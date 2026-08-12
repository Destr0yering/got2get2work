import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { AppScreen, BackButton, Button, Card, Field, Notice, PageHeader, Pill, SectionTitle } from "../../components/primitives";
import { useApp } from "../../state/AppContext";
import { colors } from "../../theme/tokens";
import { productionApi } from "../../services/ProductionApi";
import { useAuth } from "../../auth/AuthContext";

export function SafetyHelpScreen() {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  async function submitReport() {
    setBusy(true);
    try {
      const result = await productionApi.reportSafety("safety", description);
      setDescription("");
      dispatch({ type: "SET_NOTICE", notice: `Safety report ${result.id.slice(0, 8)} was securely submitted for staff review.` });
    } catch (reason) {
      dispatch({ type: "SET_NOTICE", notice: reason instanceof Error ? reason.message : "The report could not be submitted." });
    } finally {
      setBusy(false);
    }
  }
  return (
    <AppScreen>
      <BackButton label="Ride" onPress={() => dispatch({ type: "NAVIGATE", route: "ride-thread" })} />
      <PageHeader eyebrow="Safety & help" title="Support stays within reach" subtitle="Use emergency services for immediate danger. Got2Get2Work’s prototype does not dispatch emergency assistance." />
      {state.notice ? <Notice message={state.notice} tone="amber" /> : null}
      <Card tone="red"><Pill label="Emergency" tone="red" /><Text style={styles.title}>Call local emergency services</Text><Text style={styles.body}>Use your phone’s emergency calling feature if you or someone else is in immediate danger.</Text></Card>
      <SectionTitle title="Ride controls" />
      <Button label="Preview trusted-contact sharing" variant="secondary" onPress={() => dispatch({ type: "SET_NOTICE", notice: "Demo preview only—no trip information was sent. Production sharing requires a confirmed contact and a second approval." })} />
      <Field label="Describe a safety concern" value={description} onChangeText={setDescription} multiline maxLength={3000} hint="Reports are stored within your employer-benefit tenant and reviewed by authorized staff." />
      <Button label="Submit safety report" variant="secondary" busy={busy} disabled={!user || description.trim().length < 10} onPress={submitReport} />
      {!user ? <Text style={styles.disclaimer}>Sign in with your employer benefit to submit a report. You may still contact support@got2get2work.com.</Text> : null}
      <Button label="Block this coworker" variant="danger" disabled onPress={() => undefined} accessibilityHint="Available when a production coworker match is selected." />
      <Text style={styles.disclaimer}>Work email verification confirms workplace membership only. It is not a driver background, license, or insurance check.</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({ title: { color: colors.ink, fontSize: 18, fontWeight: "900", marginTop: 10 }, body: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 }, disclaimer: { color: colors.muted, fontSize: 10, lineHeight: 16, textAlign: "center", margin: 14 } });
