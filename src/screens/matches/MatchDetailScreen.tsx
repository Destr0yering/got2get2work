import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AgentSourceBadge, AppScreen, BackButton, Button, Card, Choice, Notice, PageHeader, Pill, SectionTitle } from "../../components/primitives";
import { RouteSketch } from "../../components/RouteSketch";
import { applyPickupOption, jordanPickupOptions, matches } from "../../data/demoSeed";
import { useApp } from "../../state/AppContext";
import { colors, radius } from "../../theme/tokens";

export function MatchDetailScreen() {
  const { state, dispatch, explainSelectedMatch } = useApp();
  const baseMatch = matches.find((candidate) => candidate.id === state.selectedMatchId) ?? matches[0];
  const match = applyPickupOption(baseMatch, state.selectedPickupOptionId);
  const canRequest = state.actorId === "maya" && state.trip.status === "options_ready" && match.id === "match-jordan";
  const canChangePickup = canRequest;
  return (
    <AppScreen wide>
      <BackButton label="Matches" onPress={() => dispatch({ type: "SET_TAB", tab: "matches" })} />
      <PageHeader eyebrow={match.fitLabel} title={`${match.personName} fits both commute legs`} subtitle={`Seeded demo history · ${match.completedRides} completed rides · ${match.onTimeRate} on-time`} />
      <RouteSketch pickup={match.meetingArea} worksite="North Campus" detourMinutes={match.detourMinutes} />
      <View style={styles.stats}>
        <Stat value={`${match.overlapMinutes} min`} label="To-work overlap" />
        <Stat value={`${match.departureOverlapMinutes} min`} label="Home overlap" />
        <Stat value={match.suggestedRoundTripShare} label="Round-trip share" />
      </View>
      <SectionTitle title="Both commute legs" detail="The return plan is evaluated separately instead of assuming the morning match also works after the shift." />
      <Card>
        <PrivacyRow label="To work" value={`${match.pickupTime} pickup · ${match.arrivalTime} arrival · +${match.detourMinutes} min driver detour`} tone="green" />
        <PrivacyRow label="From work" value={`${match.departureTime} departure · ${match.returnArrivalTime} return arrival · ${match.departureOverlapMinutes}-min schedule overlap`} tone="green" />
      </Card>
      {match.id === "match-jordan" ? (
        <>
          <SectionTitle title="Choose a public pickup" detail="A proposal updates the same time, detour, and expense values for both demo coworkers." />
          {canChangePickup ? (
            <>
              <Choice label={`${jordanPickupOptions.library.label} · 6:22 AM · +5 min`} detail="Lower detour and the current recommendation" selected={state.selectedPickupOptionId === "library"} onPress={() => dispatch({ type: "SELECT_PICKUP_OPTION", pickupOptionId: "library" })} />
              <Choice label={`${jordanPickupOptions.transit.label} · 6:18 AM · +7 min`} detail="Earlier pickup beside the public transit stop" selected={state.selectedPickupOptionId === "transit"} onPress={() => dispatch({ type: "SELECT_PICKUP_OPTION", pickupOptionId: "transit" })} />
            </>
          ) : <Card tone="amber"><Text style={styles.costText}>{jordanPickupOptions[state.selectedPickupOptionId].label} is locked for this request. Changing it would require renewed approval from both coworkers.</Text></Card>}
        </>
      ) : null}
      <SectionTitle title="Why this match works" detail="Explanations run only when you ask. They can restate validated facts, but cannot invent a route or approve a ride." />
      <Card tone="blue">
        {state.agentBusy ? <Text style={styles.agentLoading}>Preparing a fact-backed explanation…</Text> : null}
        {state.matchExplanation ? (
          <>
            <AgentSourceBadge meta={state.matchExplanation} />
            <Text style={styles.explanation}>{state.matchExplanation.message}</Text>
            {state.matchExplanation.bullets.map((bullet) => <View key={bullet} style={styles.factRow}><View style={styles.factDot} /><Text style={styles.fact}>{bullet}</Text></View>)}
          </>
        ) : null}
        {state.agentError ? <Notice tone="red" message={state.agentError} /> : null}
        {!state.agentBusy && !state.matchExplanation ? <Button label="Ask the agent why" variant="quiet" onPress={() => void explainSelectedMatch()} /> : null}
      </Card>
      <SectionTitle title="Privacy before acceptance" />
      <Card>
        <PrivacyRow label="Visible now" value="First name, seeded workplace membership, approximate area, fictional commute history" tone="green" />
        <PrivacyRow label="Still hidden" value="Exact meeting point, vehicle details, personal contact details" tone="amber" />
      </Card>
      <Card tone="amber">
        <Pill label="Transparent estimate" tone="amber" />
        <Text style={styles.costTitle}>{match.suggestedShare} per leg · {match.suggestedRoundTripShare} round trip</Text>
        <Text style={styles.costText}>The suggested trip value combines incremental fuel and tolls with half of the shared-route operating cost. It is capped below the estimated trip cost and comparable solo options. Got2Get2Work does not process payment.</Text>
      </Card>
      <Button label={canRequest ? `Request a round trip with ${match.personName}` : match.id === "match-avery" ? "Reserved for standing backup demo" : "A request or ride is already active"} disabled={!canRequest} onPress={() => dispatch({ type: "SEND_REQUEST" })} />
      <Text style={styles.disclaimer}>Sending shares the approximate pickup area and match facts. The meeting point unlocks only after the driver accepts.</Text>
    </AppScreen>
  );
}

function Stat({ value, label }: { value: string; label: string }) { return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }
function PrivacyRow({ label, value, tone }: { label: string; value: string; tone: "green" | "amber" }) { return <View style={styles.privacyRow}><Pill label={label} tone={tone} /><Text style={styles.privacyValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 14 },
  stat: { flexGrow: 1, flexBasis: 100, minHeight: 70, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 10, justifyContent: "center" },
  statValue: { color: colors.ink, fontWeight: "900", fontSize: 15 },
  statLabel: { color: colors.muted, fontSize: 11, lineHeight: 15, marginTop: 4 },
  agentLoading: { color: colors.cobaltDark, fontWeight: "800", paddingVertical: 12 },
  explanation: { color: colors.ink, fontSize: 14, lineHeight: 21, fontWeight: "700", marginTop: 13, marginBottom: 7 },
  factRow: { flexDirection: "row", gap: 9, alignItems: "flex-start", marginTop: 8 },
  factDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.kind, marginTop: 5 },
  fact: { color: "#385181", fontSize: 12, lineHeight: 18, flex: 1 },
  privacyRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  privacyValue: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  costTitle: { color: colors.ink, fontSize: 18, fontWeight: "900", marginTop: 10 },
  costText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  disclaimer: { color: colors.muted, fontSize: 10, lineHeight: 15, textAlign: "center", margin: 13 }
});
