import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen, BackButton, Button, Card, Choice, Field, PageHeader, Pill } from "../../components/primitives";
import { useApp } from "../../state/AppContext";
import { colors } from "../../theme/tokens";

export function CommuteProfileScreen() {
  const { state, dispatch } = useApp();
  const [displayName, setDisplayName] = useState(state.profile.displayName);
  const [areaLabel, setAreaLabel] = useState(state.profile.areaLabel);
  const [toWorkRole, setToWorkRole] = useState<"passenger" | "driver">(state.profile.toWorkRole);
  const [homeRole, setHomeRole] = useState<"passenger" | "driver">(state.profile.homeRole);
  const role = toWorkRole === homeRole ? toWorkRole : "either";
  const [seats, setSeats] = useState(state.profile.seats || 2);
  const [maxDetourMinutes, setMaxDetourMinutes] = useState(state.profile.maxDetourMinutes);
  return (
    <AppScreen>
      <BackButton label="Privacy choices" onPress={() => dispatch({ type: "NAVIGATE", route: "privacy" })} />
      <PageHeader eyebrow="Commute profile" title="Tell us only what matching needs" subtitle="The MVP does not request an exact home address. A cross-street or general-area label is still location information and is stored in local demo state." />
      <Card tone="blue">
        <Pill label="Demo work email · fictional" tone="blue" />
        <Text style={styles.workplace}>Northstar Fulfillment · North Campus</Text>
        <Text style={styles.muted}>maya@northstar.demo</Text>
      </Card>
      <Field label="First name shown to coworkers" value={displayName} onChangeText={setDisplayName} autoCapitalize="words" />
      <Field
        label="Nearby cross streets or general pickup area"
        value={areaLabel}
        onChangeText={setAreaLabel}
        placeholder="Example: Pine St & 4th Ave"
        hint="Your entry appears in Profile. Seeded recommendations use broader area labels; the selected public meeting point appears after both demo coworkers accept."
      />
      <Text style={styles.label}>How can you commute?</Text>
      <Choice label="Both legs: I need a ride" detail="Show compatible coworkers who can drive." selected={role === "passenger"} onPress={() => { setToWorkRole("passenger"); setHomeRole("passenger"); }} />
      <Choice label="Both legs: I can drive" detail="Choose seats and a maximum detour." selected={role === "driver"} onPress={() => { setToWorkRole("driver"); setHomeRole("driver"); }} />
      <Choice label="Choose each leg" detail="Set a different role for the trip to work and the trip home." selected={role === "either"} onPress={() => { setToWorkRole("passenger"); setHomeRole("driver"); }} />
      <Card>
        <Text style={styles.controlTitle}>To work</Text>
        <View style={styles.controlRow}>
          <Choice label="Need a ride to work" selected={toWorkRole === "passenger"} onPress={() => setToWorkRole("passenger")} />
          <Choice label="Can drive to work" selected={toWorkRole === "driver"} onPress={() => setToWorkRole("driver")} />
        </View>
        <Text style={styles.controlTitle}>Home after the shift</Text>
        <View style={styles.controlRow}>
          <Choice label="Need a ride home" selected={homeRole === "passenger"} onPress={() => setHomeRole("passenger")} />
          <Choice label="Can drive home" selected={homeRole === "driver"} onPress={() => setHomeRole("driver")} />
        </View>
      </Card>
      {toWorkRole === "driver" || homeRole === "driver" ? (
        <Card tone="blue">
          <Text style={styles.controlTitle}>Driver boundaries</Text>
          <Text style={styles.label}>Seats available</Text>
          <View style={styles.controlRow}>{[1, 2, 3].map((value) => <Choice key={value} label={String(value)} selected={seats === value} onPress={() => setSeats(value)} />)}</View>
          <Text style={styles.label}>Maximum added detour</Text>
          <View style={styles.controlRow}>{[5, 10, 15].map((value) => <Choice key={value} label={`${value} min`} selected={maxDetourMinutes === value} onPress={() => setMaxDetourMinutes(value)} />)}</View>
        </Card>
      ) : null}
      <Button
        label="Save commute profile"
        disabled={!displayName.trim() || !areaLabel.trim()}
        onPress={() => dispatch({
          type: "SAVE_PROFILE",
          profile: { displayName: displayName.trim(), areaLabel: areaLabel.trim(), role, toWorkRole, homeRole, maxDetourMinutes, seats: toWorkRole === "passenger" && homeRole === "passenger" ? 0 : seats }
        })}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  workplace: { color: colors.ink, fontWeight: "900", fontSize: 17, marginTop: 11 },
  muted: { color: colors.muted, fontSize: 12, marginTop: 4 },
  label: { color: colors.ink, fontWeight: "900", fontSize: 15, marginBottom: 9, marginTop: 10 },
  controlTitle: { color: colors.ink, fontWeight: "900", fontSize: 17 },
  controlRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 }
});
