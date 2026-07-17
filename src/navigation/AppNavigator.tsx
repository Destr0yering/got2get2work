import React from "react";
import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { Brand, Button, Notice } from "../components/primitives";
import { personas } from "../data/demoSeed";
import { TabId } from "../domain/models";
import { MatchesScreen } from "../screens/matches/MatchesScreen";
import { MatchDetailScreen } from "../screens/matches/MatchDetailScreen";
import { CommuteProfileScreen } from "../screens/onboarding/CommuteProfileScreen";
import { PrivacyScreen } from "../screens/onboarding/PrivacyScreen";
import { WelcomeScreen } from "../screens/onboarding/WelcomeScreen";
import { PrivacyControlsScreen } from "../screens/profile/PrivacyControlsScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { AppearanceScreen } from "../screens/profile/AppearanceScreen";
import { RideThreadScreen } from "../screens/ride/RideThreadScreen";
import { PickupTrackerScreen } from "../screens/ride/PickupTrackerScreen";
import { SafetyHelpScreen } from "../screens/ride/SafetyHelpScreen";
import { LegalScreen } from "../screens/legal/LegalScreen";
import { AgentScheduleScreen } from "../screens/schedule/AgentScheduleScreen";
import { ScheduleReviewScreen } from "../screens/schedule/ScheduleReviewScreen";
import { ScheduleScreen } from "../screens/schedule/ScheduleScreen";
import { RecoveryScreen } from "../screens/today/RecoveryScreen";
import { TodayScreen } from "../screens/today/TodayScreen";
import { useApp } from "../state/AppContext";
import { colors, contentWidth, spacing } from "../theme/tokens";
import { avatarChoice } from "../domain/appearance";

export function AppNavigator() {
  const { state } = useApp();
  if (state.route === "main") return <MainShell />;
  let screen: React.ReactNode = <WelcomeScreen />;
  if (state.route === "privacy") screen = <PrivacyScreen />;
  if (state.route === "profile-setup") screen = <CommuteProfileScreen />;
  if (state.route === "schedule-agent") screen = <AgentScheduleScreen />;
  if (state.route === "schedule-review") screen = <ScheduleReviewScreen />;
  if (state.route === "match-detail") screen = <MatchDetailScreen />;
  if (state.route === "recovery") screen = <RecoveryScreen />;
  if (state.route === "ride-thread") screen = <RideThreadScreen />;
  if (state.route === "pickup-tracker") screen = <PickupTrackerScreen />;
  if (state.route === "safety-help") screen = <SafetyHelpScreen />;
  if (state.route === "privacy-controls") screen = <PrivacyControlsScreen />;
  if (state.route === "appearance") screen = <AppearanceScreen />;
  if (state.route === "terms") screen = <LegalScreen kind="terms" />;
  if (state.route === "privacy-policy") screen = <LegalScreen kind="privacy" />;
  return <SafeAreaView style={[styles.safe, state.route === "welcome" && styles.safeWelcome]}>{screen}</SafeAreaView>;
}

function MainShell() {
  const { state, dispatch } = useApp();
  const actor = personas[state.actorId];
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerOuter}>
        <View style={styles.headerInner}>
          <Brand compact />
          <Pressable accessibilityRole="button" accessibilityLabel="Open demo controls" onPress={() => dispatch({ type: "SET_DEMO_CONTROLS", open: true })} style={styles.actorButton}>
            <View style={styles.actorAvatar}><Text style={styles.actorInitials}>{avatarChoice(state.appearances[state.actorId].avatarId).symbol}</Text></View>
            <View><Text style={styles.demoLabel}>DEMO AS</Text><Text style={styles.actorName}>{actor.firstName} · Change</Text></View>
          </Pressable>
        </View>
      </View>
      {state.notice ? <Notice message={state.notice} tone={state.trip.status === "cancelled" ? "red" : "green"} /> : null}
      <View style={styles.content}>
        {state.activeTab === "today" ? <TodayScreen /> : null}
        {state.activeTab === "matches" ? <MatchesScreen /> : null}
        {state.activeTab === "schedule" ? <ScheduleScreen /> : null}
        {state.activeTab === "profile" ? <ProfileScreen /> : null}
      </View>
      <BottomTabs />
      <DemoControls />
    </SafeAreaView>
  );
}

function BottomTabs() {
  const { state, dispatch } = useApp();
  const items: Array<{ id: TabId; symbol: string; label: string }> = [
    { id: "today", symbol: "●", label: "Today" },
    { id: "matches", symbol: "↗", label: "Matches" },
    { id: "schedule", symbol: "▦", label: "Schedule" },
    { id: "profile", symbol: "◉", label: "Profile" }
  ];
  return (
    <View style={styles.tabOuter}><View style={styles.tabs}>{items.map((item) => {
      const active = state.activeTab === item.id;
      return <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={item.label} onPress={() => dispatch({ type: "SET_TAB", tab: item.id })} style={({ pressed }) => [styles.tab, pressed && styles.pressed]}><Text style={[styles.tabSymbol, active && styles.tabActive]}>{item.symbol}</Text><Text style={[styles.tabLabel, active && styles.tabActive]}>{item.label}</Text></Pressable>;
    })}</View></View>
  );
}

function DemoControls() {
  const { state, dispatch } = useApp();
  return (
    <Modal visible={state.demoControlsOpen} transparent animationType="slide" onRequestClose={() => dispatch({ type: "SET_DEMO_CONTROLS", open: false })}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close demo controls" style={styles.scrim} onPress={() => dispatch({ type: "SET_DEMO_CONTROLS", open: false })} />
      <View style={styles.sheet} accessibilityViewIsModal>
        <ScrollView contentContainerStyle={styles.sheetContent}>
        <Text accessibilityRole="header" style={styles.sheetTitle}>Demo controls</Text>
        <Text style={styles.sheetBody}>Switch personas, simulate recovery, or restore the pristine local seed.</Text>
        <Button label={state.actorId === "maya" ? "Switch to Jordan (driver)" : "Switch to Maya (passenger)"} variant="secondary" onPress={() => dispatch({ type: "SWITCH_ACTOR", actorId: state.actorId === "maya" ? "jordan" : "maya" })} />
        {state.trip.status === "confirmed" ? <Button label="Simulate driver cancellation" variant="danger" onPress={() => dispatch({ type: "CANCEL_RIDE" })} /> : null}
        {state.trip.status === "options_ready" ? <Button label={state.matchScenario === "matches" ? "Simulate no compatible matches" : "Restore compatible matches"} variant="quiet" onPress={() => dispatch({ type: "SET_MATCH_SCENARIO", scenario: state.matchScenario === "matches" ? "none" : "matches" })} /> : null}
        <Button label="Reset demo to welcome" variant="quiet" onPress={() => dispatch({ type: "RESET_DEMO" })} />
        <Button label="Close" variant="secondary" onPress={() => dispatch({ type: "SET_DEMO_CONTROLS", open: false })} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  safeWelcome: { backgroundColor: colors.midnight },
  headerOuter: { backgroundColor: colors.midnight, alignItems: "center" },
  headerInner: { width: "100%", maxWidth: contentWidth.detail, minHeight: 70, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  actorButton: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 48 },
  actorAvatar: { width: 36, height: 36, borderRadius: 13, backgroundColor: colors.midnightSoft, borderWidth: 1, borderColor: "#405476", alignItems: "center", justifyContent: "center" },
  actorInitials: { color: colors.white, fontSize: 11, fontWeight: "900" },
  demoLabel: { color: "#8296B5", fontSize: 8, fontWeight: "900", letterSpacing: 0.6 },
  actorName: { color: colors.white, fontSize: 10, fontWeight: "800", marginTop: 2 },
  content: { flex: 1 },
  tabOuter: { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, alignItems: "center" },
  tabs: { width: "100%", maxWidth: contentWidth.detail, minHeight: 70, flexDirection: "row" },
  tab: { flex: 1, minHeight: 60, alignItems: "center", justifyContent: "center", gap: 3 },
  tabSymbol: { color: "#8993A2", fontSize: 19, fontWeight: "900" },
  tabLabel: { color: "#8993A2", fontSize: 10, fontWeight: "800" },
  tabActive: { color: colors.cobalt },
  pressed: { opacity: 0.7 },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(10,24,48,0.48)" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "86%" },
  sheetContent: { padding: 20, paddingBottom: 28 },
  sheetTitle: { color: colors.ink, fontSize: 23, fontWeight: "900" },
  sheetBody: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 5, marginBottom: 5 }
});
