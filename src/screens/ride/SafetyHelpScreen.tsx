import React from "react";
import { StyleSheet, Text } from "react-native";

import { AppScreen, BackButton, Button, Card, Notice, PageHeader, Pill, SectionTitle } from "../../components/primitives";
import { useApp } from "../../state/AppContext";
import { colors } from "../../theme/tokens";

export function SafetyHelpScreen() {
  const { state, dispatch } = useApp();
  return (
    <AppScreen>
      <BackButton label="Ride" onPress={() => dispatch({ type: "NAVIGATE", route: "ride-thread" })} />
      <PageHeader eyebrow="Safety & help" title="Support stays within reach" subtitle="Use emergency services for immediate danger. CommuteKind’s prototype does not dispatch emergency assistance." />
      {state.notice ? <Notice message={state.notice} tone="amber" /> : null}
      <Card tone="red"><Pill label="Emergency" tone="red" /><Text style={styles.title}>Call local emergency services</Text><Text style={styles.body}>Use your phone’s emergency calling feature if you or someone else is in immediate danger.</Text></Card>
      <SectionTitle title="Ride controls" />
      <Button label="Preview trusted-contact sharing" variant="secondary" onPress={() => dispatch({ type: "SET_NOTICE", notice: "Demo preview only—no trip information was sent. Production sharing requires a confirmed contact and a second approval." })} />
      <Button label="Preview safety report" variant="secondary" onPress={() => dispatch({ type: "SET_NOTICE", notice: "Demo preview only—no report was submitted. Production requires a staffed incident workflow." })} />
      <Button label="Demo: blocking not enabled" variant="danger" onPress={() => dispatch({ type: "SET_NOTICE", notice: "No user was blocked. Production matching must enforce server-side block records before launch." })} />
      <Text style={styles.disclaimer}>Work email verification confirms workplace membership only. It is not a driver background, license, or insurance check.</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({ title: { color: colors.ink, fontSize: 18, fontWeight: "900", marginTop: 10 }, body: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 }, disclaimer: { color: colors.muted, fontSize: 10, lineHeight: 16, textAlign: "center", margin: 14 } });
