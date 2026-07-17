import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useApp } from "../../state/AppContext";
import { colors, radius, spacing } from "../../theme/tokens";
import { AppScreen, Brand, Button, Card, Pill } from "../../components/primitives";

export function WelcomeScreen() {
  const { dispatch } = useApp();
  return (
    <View style={styles.shell}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <AppScreen backgroundColor={colors.midnight}>
        <Brand />
        <View style={styles.hero}>
          <Pill label="Fictional coworker demo" tone="blue" />
          <Text accessibilityRole="header" style={styles.title}>A better way to get every shift covered.</Text>
          <Text style={styles.subtitle}>Got2Get2Work introduces coworkers whose schedules and routes line up without asking for an exact home address.</Text>
        </View>
        <Card tone="dark" style={styles.preview}>
          <Text style={styles.previewEyebrow}>TUESDAY · 7:00 AM SHIFT</Text>
          <Text style={styles.previewTitle}>2 compatible coworkers found</Text>
          <View style={styles.routeRow}>
            <View style={styles.dot} /><View style={styles.line} /><View style={styles.dotBlue} /><View style={styles.line} /><View style={styles.dotGreen} />
          </View>
          <View style={styles.labelRow}><Text style={styles.routeLabel}>Driver</Text><Text style={styles.routeLabel}>Public pickup</Text><Text style={styles.routeLabel}>Work</Text></View>
        </Card>
        <Card>
          <Text style={styles.cardTitle}>The agent suggests. You decide.</Text>
          <Text style={styles.cardBody}>Schedule windows power local matching. You separately approve every coworker request, public meeting point, and backup offer.</Text>
          <Button label="Review policies and start setup" onPress={() => dispatch({ type: "NAVIGATE", route: "privacy" })} />
          <Button label="Open the seeded demo" variant="secondary" onPress={() => dispatch({ type: "SKIP_TO_DEMO" })} />
          <Text style={styles.demoNote}>Seeded demo runs locally and does not require Wi-Fi.</Text>
        </Card>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.midnight, overflow: "hidden" },
  glowOne: { position: "absolute", width: 340, height: 340, borderRadius: 170, backgroundColor: "#214C9A", opacity: 0.34, top: -150, right: -160 },
  glowTwo: { position: "absolute", width: 280, height: 280, borderRadius: 140, backgroundColor: colors.kind, opacity: 0.16, bottom: -130, left: -150 },
  hero: { marginTop: spacing.xxl, marginBottom: spacing.lg },
  title: { color: colors.white, fontSize: 40, lineHeight: 46, fontWeight: "900", letterSpacing: -1.1, marginTop: 16 },
  subtitle: { color: "#BAC6D9", fontSize: 16, lineHeight: 24, marginTop: 15 },
  preview: { padding: 18 },
  previewEyebrow: { color: "#91A5C4", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  previewTitle: { color: colors.white, fontSize: 19, fontWeight: "900", marginTop: 5 },
  routeRow: { flexDirection: "row", alignItems: "center", marginTop: 22 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.white },
  dotBlue: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#86A9FF" },
  dotGreen: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#63D2AE" },
  line: { flex: 1, height: 2, backgroundColor: "#536A8C", marginHorizontal: 5 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  routeLabel: { color: "#9FAFC7", fontSize: 10 },
  cardTitle: { color: colors.ink, fontSize: 20, fontWeight: "900" },
  cardBody: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 6 },
  demoNote: { color: colors.muted, fontSize: 11, textAlign: "center", marginTop: 10 },
  unused: { borderRadius: radius.md }
});
