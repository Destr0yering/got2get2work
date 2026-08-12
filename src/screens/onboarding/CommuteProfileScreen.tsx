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
  const [centerRearSeatEnabled, setCenterRearSeatEnabled] = useState(Boolean(state.profile.centerRearSeatEnabled));
  const [earliestEmbarkmentTime, setEarliestEmbarkmentTime] = useState(state.profile.earliestEmbarkmentTime ?? "6:40 AM");
  const [driverArrivalTime, setDriverArrivalTime] = useState(state.profile.driverArrivalTime ?? "6:50 AM");
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
      <Text style={styles.label}>Set up each commute</Text>
      <Choice label="▣ 2work — I need a ride" detail="Find a coworker who can drive to work." selected={role === "passenger"} onPress={() => { setToWorkRole("passenger"); setHomeRole("passenger"); }} />
      <Choice label="▣ 2work — I can drive & save on fuel" detail="Share the route you already drive and unlock fuel or charging discounts from participating partners." selected={role === "driver"} onPress={() => { setToWorkRole("driver"); setHomeRole("driver"); }} />
      <Choice label="Set up 2work and 2home separately" detail="Choose a different role in each direction." selected={role === "either"} onPress={() => { setToWorkRole("passenger"); setHomeRole("driver"); }} />
      <Card>
        <Text style={styles.controlTitle}>▣ 2work</Text>
        <View style={styles.controlRow}>
          <Choice label="Need a ride to work" selected={toWorkRole === "passenger"} onPress={() => setToWorkRole("passenger")} />
          <Choice label="Can drive to work" selected={toWorkRole === "driver"} onPress={() => setToWorkRole("driver")} />
        </View>
        <Text style={styles.controlTitle}>⌂ 2home</Text>
        <View style={styles.controlRow}>
          <Choice label="Need a ride home" selected={homeRole === "passenger"} onPress={() => setHomeRole("passenger")} />
          <Choice label="Can drive home" selected={homeRole === "driver"} onPress={() => setHomeRole("driver")} />
        </View>
      </Card>
      {toWorkRole === "driver" || homeRole === "driver" ? (
        <>
        <Card tone="green">
          <Pill label="Driver fuel perk" tone="green" />
          <Text style={styles.perkTitle}>Fill an empty seat. Unlock up to 10¢ off each gallon.</Text>
          <Text style={styles.perkBody}>Complete four verified shared trips to unlock the pilot fuel discount. EV drivers can receive an equivalent charging perk where a participating partner is available.</Text>
          <Text style={styles.perkFine}>You will also see the suggested trip value before accepting. Fuel and charging offers depend on partner availability and pilot terms.</Text>
        </Card>
        <Card tone="blue">
          <Text style={styles.controlTitle}>Driver boundaries</Text>
          <Text style={styles.label}>Seats available</Text>
          <Text style={styles.muted}>Comfortable seats: front passenger plus the two outer rear seats.</Text>
          <View style={styles.controlRow}>{[1, 2, 3].map((value) => <Choice key={value} label={String(value)} selected={seats === value} onPress={() => setSeats(value)} />)}</View>
          <Choice label="Enable center rear seat for emergencies" detail="Off by default and never counted unless you turn it on." selected={centerRearSeatEnabled} onPress={() => setCenterRearSeatEnabled((value) => !value)} />
          <Text style={styles.label}>Maximum added detour</Text>
          <View style={styles.controlRow}>{[5, 10, 15].map((value) => <Choice key={value} label={`${value} min`} selected={maxDetourMinutes === value} onPress={() => setMaxDetourMinutes(value)} />)}</View>
          <Field label="Earliest you can embark" value={earliestEmbarkmentTime} onChangeText={setEarliestEmbarkmentTime} placeholder="Example: 6:40 AM" />
          <Field label="Driver arrival target" value={driverArrivalTime} onChangeText={setDriverArrivalTime} placeholder="Example: 6:50 AM" hint="The suggested target is 10 minutes early." />
        </Card>
        </>
      ) : null}
      <Button
        label="Save commute profile"
        disabled={!displayName.trim() || !areaLabel.trim()}
        onPress={() => dispatch({
          type: "SAVE_PROFILE",
          profile: { displayName: displayName.trim(), areaLabel: areaLabel.trim(), role, toWorkRole, homeRole, maxDetourMinutes, seats: toWorkRole === "passenger" && homeRole === "passenger" ? 0 : seats, comfortablePassengerSeats: seats, centerRearSeatEnabled, earliestEmbarkmentTime: earliestEmbarkmentTime.trim(), driverArrivalTime: driverArrivalTime.trim(), earlyArrivalMinutes: 10 }
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
  perkTitle: { color: colors.ink, fontSize: 21, lineHeight: 27, fontWeight: "900", marginTop: 12 },
  perkBody: { color: colors.ink, fontSize: 13, lineHeight: 20, marginTop: 8 },
  perkFine: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 9 },
  controlRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 }
});
