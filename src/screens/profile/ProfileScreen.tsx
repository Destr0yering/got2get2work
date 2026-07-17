import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen, Button, Card, PageHeader, Pill, SectionTitle } from "../../components/primitives";
import { personas } from "../../data/demoSeed";
import { useApp } from "../../state/AppContext";
import { colors, radius } from "../../theme/tokens";
import { avatarChoice, vehicleDescription } from "../../domain/appearance";

export function ProfileScreen() {
  const { state, dispatch } = useApp();
  const actor = personas[state.actorId];
  const displayedRole = state.actorId === "jordan" ? "driver" : state.profile.role;
  const displayedToWorkRole = state.actorId === "jordan" ? "driver" : state.profile.toWorkRole;
  const displayedHomeRole = state.actorId === "jordan" ? "driver" : state.profile.homeRole;
  const displayedArea = state.actorId === "jordan" ? actor.areaLabel : state.profile.areaLabel;
  const displayedSeats = state.actorId === "jordan" ? 2 : state.profile.seats;
  const displayedDetour = state.actorId === "jordan" ? 10 : state.profile.maxDetourMinutes;
  const appearance = state.appearances[state.actorId];
  const avatar = avatarChoice(appearance.avatarId);
  return (
    <AppScreen>
      <PageHeader eyebrow="Profile" title="Your commute boundaries" subtitle="Control your role, permissions, privacy, and safety settings." />
      <Card tone="dark">
        <View style={styles.profileRow}><View style={styles.avatar}><Text style={styles.avatarText}>{avatar.symbol}</Text></View><View style={styles.flex}><Text style={styles.name}>{actor.firstName}</Text><Text style={styles.email}>{actor.workEmail}</Text></View><Pill label="Fictional demo profile" tone="blue" /></View>
      </Card>
      <SectionTitle title="Commute profile" />
      <Card>
        <Setting label="To work" value={displayedToWorkRole === "passenger" ? "Needs a ride" : "Can drive"} />
        <Setting label="Home after shift" value={displayedHomeRole === "passenger" ? "Needs a ride" : "Can drive"} />
        <Setting label="Pickup area" value={displayedArea} />
        {displayedRole !== "passenger" ? <Setting label="Seats / maximum detour" value={`${displayedSeats} seats · ${displayedDetour} minutes`} last /> : null}
      </Card>
      <SectionTitle title="Pickup identity" />
      <Card>
        <Setting label="Avatar" value={avatar.label} />
        <Setting label="Vehicle" value={vehicleDescription(appearance)} last />
      </Card>
      <Button label="Customize avatar and vehicle" variant="secondary" onPress={() => dispatch({ type: "NAVIGATE", route: "appearance" })} />
      <SectionTitle title="Trust & privacy" />
      <Card>
        <Setting label="Workplace membership" value="Seeded North Campus demo membership" />
        <Setting label="Schedule access" value={state.schedulePermission ? "Simulated preference on · not connected" : "Not connected"} />
        <Setting label="Location sharing" value="Approximate until mutual acceptance" last />
      </Card>
      <Button label="Privacy and permission controls" variant="secondary" onPress={() => dispatch({ type: "NAVIGATE", route: "privacy-controls" })} />
      {state.actorId === "maya" ? <Button label="Edit commute profile" variant="secondary" onPress={() => dispatch({ type: "NAVIGATE", route: "profile-setup" })} /> : null}
      <Button label="Open demo controls" variant="quiet" onPress={() => dispatch({ type: "SET_DEMO_CONTROLS", open: true })} />
      <Text style={styles.disclaimer}>Ride coordination is not a guarantee of transportation. Driver license and insurance verification are not represented in this prototype.</Text>
    </AppScreen>
  );
}

function Setting({ label, value, last = false }: { label: string; value: string; last?: boolean }) { return <View style={[styles.setting, last && styles.last]}><Text style={styles.settingLabel}>{label}</Text><Text style={styles.settingValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  profileRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  avatar: { width: 50, height: 50, borderRadius: 17, backgroundColor: colors.cobalt, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.white, fontWeight: "900" },
  flex: { flex: 1 },
  name: { color: colors.white, fontSize: 18, fontWeight: "900" },
  email: { color: "#AFC0D8", fontSize: 11, marginTop: 3 },
  setting: { minHeight: 62, borderBottomWidth: 1, borderBottomColor: colors.border, justifyContent: "center" },
  last: { borderBottomWidth: 0 },
  settingLabel: { color: colors.muted, fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  settingValue: { color: colors.ink, fontSize: 14, fontWeight: "800", marginTop: 4 },
  disclaimer: { color: colors.muted, fontSize: 10, lineHeight: 16, textAlign: "center", margin: 14 },
  unused: { borderRadius: radius.sm }
});
