import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AgentSourceBadge, AppScreen, BackButton, Button, Card, PageHeader, Pill } from "../../components/primitives";
import { formatShiftCount } from "../../domain/schedule";
import { useApp } from "../../state/AppContext";
import { colors, radius } from "../../theme/tokens";

export function ScheduleReviewScreen() {
  const { state, dispatch } = useApp();
  const result = state.parsedSchedule;
  if (!result) return null;
  const shiftCount = formatShiftCount(result.shifts.length);
  const createsFirstPlan = state.trip.status === "needs_plan";
  return (
    <AppScreen wide>
      <BackButton label="Edit schedule text" onPress={() => dispatch({ type: "NAVIGATE", route: "schedule-agent" })} />
      <PageHeader eyebrow="Review before saving" title={`The agent found ${shiftCount}`} subtitle={result.summary} />
      <AgentSourceBadge meta={result} />
      <View style={styles.list}>
        {result.shifts.map((shift) => (
          <Card key={shift.id}>
            <View style={styles.row}>
              <View style={styles.dateBlock}><Text style={styles.weekday}>{shift.weekday}</Text><Text style={styles.date}>{shift.dateLabel}</Text></View>
              <View style={styles.flex}>
                <Text style={styles.time}>{shift.startLabel}–{shift.endLabel}</Text>
                <Text style={styles.worksite}>{shift.worksite}</Text>
                <Text style={styles.role}>{shift.roleLabel}</Text>
              </View>
              <Pill label="Ready" tone="green" />
            </View>
          </Card>
        ))}
      </View>
      <Card tone="green">
        <Text style={styles.approvalTitle}>Nothing is shared automatically</Text>
        <Text style={styles.approvalText}>{createsFirstPlan ? "Saving creates commute windows for matching." : "Saving updates your schedule without changing the status of your active commute plan."} Coworkers see compatibility, not your full schedule.</Text>
      </Card>
      <Button label={createsFirstPlan ? `Save ${shiftCount} and find matches` : `Save ${shiftCount} updates`} onPress={() => dispatch({ type: "SAVE_SCHEDULE" })} />
      <Button label="Edit the schedule" variant="secondary" onPress={() => dispatch({ type: "NAVIGATE", route: "schedule-agent" })} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: 18 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  dateBlock: { width: 57, minHeight: 57, borderRadius: radius.md, backgroundColor: colors.blueSoft, alignItems: "center", justifyContent: "center" },
  weekday: { color: colors.cobaltDark, fontWeight: "900", fontSize: 14 },
  date: { color: colors.muted, fontSize: 10, marginTop: 2 },
  flex: { flex: 1 },
  time: { color: colors.ink, fontSize: 15, fontWeight: "900" },
  worksite: { color: colors.muted, fontSize: 12, marginTop: 3 },
  role: { color: colors.muted, fontSize: 10, marginTop: 3 },
  approvalTitle: { color: colors.ink, fontSize: 15, fontWeight: "900" },
  approvalText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 }
});
