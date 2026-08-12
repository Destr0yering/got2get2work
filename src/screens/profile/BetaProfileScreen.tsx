import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "../../auth/AuthContext";
import { AppScreen, Button, Card, PageHeader, Pill, SectionTitle } from "../../components/primitives";
import { useApp } from "../../state/AppContext";
import { colors } from "../../theme/tokens";

export function BetaProfileScreen() {
  const { state, dispatch } = useApp();
  const { user, signOutUser } = useAuth();
  const profile = state.profile;
  return (
    <AppScreen>
      <PageHeader eyebrow="Authenticated beta profile" title="Your commute boundaries" subtitle="This profile belongs to your account and is used for real beta matching." />
      <Card tone="dark"><View style={styles.row}><View style={styles.avatar}><Text style={styles.avatarText}>{profile.displayName.slice(0, 1).toUpperCase()}</Text></View><View style={styles.flex}><Text style={styles.name}>{profile.displayName}</Text><Text style={styles.email}>{user?.email}</Text></View><Pill label="Beta member" tone="green" /></View></Card>
      <SectionTitle title="Commute profile" />
      <Card>
        <Setting label="To work" value={profile.toWorkRole === "passenger" ? "Needs a ride" : "Can drive"} />
        <Setting label="Home" value={profile.homeRole === "passenger" ? "Needs a ride" : "Can drive"} />
        <Setting label="General pickup area" value={profile.areaLabel || "Not set"} />
        {(profile.toWorkRole === "driver" || profile.homeRole === "driver") ? <Setting label="Seats / maximum detour" value={`${profile.seats} seats · ${profile.maxDetourMinutes} minutes`} last /> : null}
      </Card>
      <Button label="Edit commute profile" variant="secondary" onPress={() => dispatch({ type: "NAVIGATE", route: "profile-setup" })} />
      <SectionTitle title="Privacy and account" />
      <Card tone="blue"><Text style={styles.body}>Only compatibility facts and your general pickup area appear before mutual acceptance. Exact home addresses are not requested.</Text></Card>
      <Button label="Privacy and permission controls" variant="secondary" onPress={() => dispatch({ type: "NAVIGATE", route: "privacy-controls" })} />
      <Button label="Feedback or report a problem" variant="secondary" onPress={() => dispatch({ type: "NAVIGATE", route: "feedback-help" })} />
      <Button label="Sign out" variant="quiet" onPress={() => void signOutUser().then(() => dispatch({ type: "NAVIGATE", route: "welcome" }))} />
    </AppScreen>
  );
}

function Setting({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return <View style={[styles.setting, last && styles.last]}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 11 },
  avatar: { width: 50, height: 50, borderRadius: 17, backgroundColor: colors.kind, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.white, fontWeight: "900", fontSize: 18 },
  flex: { flex: 1 },
  name: { color: colors.white, fontSize: 18, fontWeight: "900" },
  email: { color: "#AFC0D8", fontSize: 11, marginTop: 3 },
  setting: { minHeight: 62, borderBottomWidth: 1, borderBottomColor: colors.border, justifyContent: "center" },
  last: { borderBottomWidth: 0 },
  label: { color: colors.muted, fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  value: { color: colors.ink, fontSize: 14, fontWeight: "800", marginTop: 4 },
  body: { color: colors.ink, fontSize: 13, lineHeight: 19 },
});
