import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen, Button, Card, PageHeader, Pill, SectionTitle } from "../../components/primitives";
import { useApp } from "../../state/AppContext";
import { colors, radius } from "../../theme/tokens";

export function ScheduleScreen() {
  const { state, dispatch } = useApp();
  const demoEnabled = process.env.EXPO_PUBLIC_DEMO_MODE === "true";
  const toWorkRole = demoEnabled && state.actorId === "jordan" ? "driver" : state.profile.toWorkRole;
  const homeRole = demoEnabled && state.actorId === "jordan" ? "driver" : state.profile.homeRole;
  const demoShifts = [
    { id: "seed-tue", weekday: "Tue", dateLabel: "Jul 21", startLabel: "7:00 AM", endLabel: "3:30 PM", worksite: "North Campus", roleLabel: "Warehouse associate" },
    { id: "seed-wed", weekday: "Wed", dateLabel: "Jul 22", startLabel: "7:00 AM", endLabel: "3:30 PM", worksite: "North Campus", roleLabel: "Warehouse associate" }
  ];
  const shifts = state.parsedSchedule?.shifts ?? (demoEnabled ? demoShifts : []);
  return (
    <AppScreen>
      <PageHeader eyebrow="Work week" title="Your commute schedule" subtitle="Coworkers see compatibility windows, not your complete schedule." />
      <Card tone={state.schedulePermission ? "green" : "amber"}>
        <View style={styles.rowBetween}>
          <View style={styles.flex}><Text style={styles.title}>{demoEnabled ? (state.schedulePermission ? "Connection preference on" : "Manual schedule") : "Private beta schedule"}</Text><Text style={styles.body}>{demoEnabled ? (state.schedulePermission ? "Simulated preference only · no scheduling account connected" : "Parsed and stored in local demo state") : "AI-structured shifts are saved to your authenticated beta account"}</Text></View>
          <Pill label={demoEnabled ? (state.schedulePermission ? "Simulated" : "Local") : "Server saved"} tone={demoEnabled ? "amber" : "green"} />
        </View>
      </Card>
      <Button label="Tell the agent about a shift" onPress={() => dispatch({ type: "NAVIGATE", route: "schedule-agent" })} />
      <SectionTitle title="Upcoming shifts" />
      {shifts.length === 0 ? <Card tone="blue"><Text style={styles.title}>No shifts saved yet</Text><Text style={styles.body}>Tell the agent about your recurring shift, review the structured result, and approve it before matching.</Text></Card> : null}
      {shifts.map((shift) => (
        <Card key={shift.id}>
          <View style={styles.shiftRow}>
            <View style={styles.dateBlock}><Text style={styles.day}>{shift.weekday}</Text><Text style={styles.date}>{shift.dateLabel}</Text></View>
            <View style={styles.flex}><Text style={styles.time}>{shift.startLabel}–{shift.endLabel}</Text><Text style={styles.body}>{shift.worksite} · {shift.roleLabel}</Text></View>
            <View style={styles.legs}><Text style={styles.leg}>To work · {toWorkRole === "passenger" ? "Need ride" : "Can drive"}</Text><Text style={styles.leg}>Home · {homeRole === "passenger" ? "Need ride" : "Can drive"}</Text></View>
          </View>
        </Card>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: "row", justifyContent: "space-between", gap: 10, alignItems: "center" },
  shiftRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  flex: { flex: 1 },
  title: { color: colors.ink, fontSize: 15, fontWeight: "900" },
  body: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 3 },
  dateBlock: { width: 54, height: 54, borderRadius: radius.md, backgroundColor: colors.blueSoft, alignItems: "center", justifyContent: "center" },
  day: { color: colors.cobaltDark, fontSize: 14, fontWeight: "900" },
  date: { color: colors.muted, fontSize: 10, marginTop: 2 },
  time: { color: colors.ink, fontSize: 14, fontWeight: "900" },
  legs: { alignItems: "flex-end", gap: 4, maxWidth: 105 },
  leg: { color: colors.cobaltDark, fontSize: 10, fontWeight: "800" }
});
