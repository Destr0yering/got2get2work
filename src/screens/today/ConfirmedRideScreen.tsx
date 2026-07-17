import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { applyPickupOption, matches } from "../../data/demoSeed";
import { MatchOption, TripStatus } from "../../domain/models";
import { useApp } from "../../state/AppContext";
import { colors, radius } from "../../theme/tokens";
import { Button, Card, Pill, SectionTitle } from "../../components/primitives";
import { RouteSketch } from "../../components/RouteSketch";
import { avatarChoice, vehicleDescription } from "../../domain/appearance";

export function ConfirmedRideScreen({ match, status }: { match: MatchOption; status: TripStatus }) {
  const { state, dispatch } = useApp();
  const recovered = status === "recovered";
  const displayMatch = recovered ? matches[1] : applyPickupOption(match, state.selectedPickupOptionId);
  const isPrimary = displayMatch.id === "match-jordan";
  const coworkerAvatar = !isPrimary ? displayMatch.initials : avatarChoice(state.appearances[state.actorId === "maya" ? "jordan" : "maya"].avatarId).symbol;
  const vehicleLabel = isPrimary ? vehicleDescription(state.appearances.jordan, "42K") : displayMatch.vehicleLabel;
  const heroTitle = state.actorId === "jordan" && isPrimary ? `Pick up Maya at ${displayMatch.pickupTime}` : `Meet ${displayMatch.personName} at ${displayMatch.pickupTime}`;
  return (
    <View>
      <Card tone="green" style={styles.heroCard}>
        <View style={styles.rowBetween}>
          <View style={styles.flex}>
            <Pill label={recovered ? "Backup confirmed" : "Ride confirmed"} tone="green" />
            <Text style={styles.heroTitle}>{heroTitle}</Text>
            <Text style={styles.heroSub}>To work · Tuesday · {displayMatch.meetingPoint}</Text>
          </View>
          <View style={styles.avatar}><Text style={styles.avatarText}>{coworkerAvatar}</Text></View>
        </View>
      </Card>
      <RouteSketch pickup={displayMatch.meetingArea} worksite="North Campus" detourMinutes={displayMatch.detourMinutes} />
      <View style={styles.metrics}>
        <Metric label="To-work pickup" value={displayMatch.pickupTime} />
        <Metric label="Leave work" value={displayMatch.departureTime} />
        <Metric label="Round-trip share" value={displayMatch.suggestedRoundTripShare} />
      </View>
      <SectionTitle title="Revealed after both agreed" />
      <Card>
        <Text style={styles.detailTitle}>{displayMatch.meetingPoint}</Text>
        <Text style={styles.detail}>Public, well-lit meeting point near your chosen area</Text>
        <View style={styles.divider} />
        <Text style={styles.detailTitle}>Return from North Campus · {displayMatch.departureTime}</Text>
        <Text style={styles.detail}>Estimated arrival near the meeting area: {displayMatch.returnArrivalTime}</Text>
        <View style={styles.divider} />
        <Text style={styles.detailTitle}>{vehicleLabel}</Text>
        <Text style={styles.detail}>These vehicle details were revealed only after mutual acceptance.</Text>
      </Card>
      {isPrimary && status === "confirmed" ? <Button label="Open pickup map & proximity" onPress={() => dispatch({ type: "NAVIGATE", route: "pickup-tracker" })} /> : null}
      <Button label="Open ride messages" onPress={() => dispatch({ type: "NAVIGATE", route: "ride-thread" })} />
      <Button label="Safety & help" variant="secondary" onPress={() => dispatch({ type: "NAVIGATE", route: "safety-help" })} />
      <Button label="Demo: mark round trip complete" variant="secondary" onPress={() => dispatch({ type: "COMPLETE_RIDE" })} />
      {!recovered ? <Button label="Demo: simulate driver cancellation" variant="quiet" onPress={() => dispatch({ type: "CANCEL_RIDE" })} /> : null}
      <Text style={styles.expenseNote}>Suggested expense share—not a fare. CommuteKind does not process payment or guarantee transportation.</Text>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  heroCard: { padding: 18 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  flex: { flex: 1 },
  heroTitle: { color: colors.ink, fontSize: 21, lineHeight: 27, fontWeight: "900", marginTop: 12 },
  heroSub: { color: colors.muted, fontSize: 13, marginTop: 5 },
  avatar: { width: 54, height: 54, borderRadius: 18, backgroundColor: colors.kind, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.white, fontWeight: "900", fontSize: 17 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 13 },
  metric: { flexGrow: 1, flexBasis: 100, minHeight: 68, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 10, justifyContent: "center" },
  metricValue: { color: colors.ink, fontWeight: "900", fontSize: 14 },
  metricLabel: { color: colors.muted, fontSize: 11, lineHeight: 15, marginTop: 4 },
  detailTitle: { color: colors.ink, fontWeight: "900", fontSize: 14 },
  detail: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 13 },
  expenseNote: { color: colors.muted, fontSize: 10, lineHeight: 15, textAlign: "center", margin: 14 }
});
