import React from "react";
import { StyleSheet, Text } from "react-native";

import { AppScreen, Button, Card, PageHeader, Pill, SectionTitle } from "../../components/primitives";
import { MatchCard } from "../../components/MatchCard";
import { applyPickupOption, matches } from "../../data/demoSeed";
import { useApp } from "../../state/AppContext";
import { colors } from "../../theme/tokens";

export function MatchesScreen() {
  const { state, dispatch } = useApp();
  const availableMatches = matches
    .filter((match) => !state.blockedMatchIds.includes(match.id))
    .map((match) => applyPickupOption(match, state.selectedPickupOptionId))
    .sort((a, b) => {
      if (!["again", "preferred"].includes(state.relationshipPreference ?? "")) return 0;
      return a.id === state.trip.activeMatchId ? -1 : b.id === state.trip.activeMatchId ? 1 : 0;
    });
  if (state.actorId === "maya" && state.profile.toWorkRole !== state.profile.homeRole && state.trip.status === "options_ready") {
    return (
      <AppScreen>
        <PageHeader eyebrow="Split commute" title="Match each leg separately" subtitle="The seeded round-trip recommendations require the same passenger role in both directions." />
        <Card tone="amber"><Pill label="No combined round trip" tone="amber" /><Text style={styles.title}>Your two roles remain unchanged</Text><Text style={styles.body}>To work: {state.profile.toWorkRole === "passenger" ? "need a ride" : "can drive"}. Home: {state.profile.homeRole === "passenger" ? "need a ride" : "can drive"}. A production matcher would search each leg independently.</Text></Card>
        <Button label="Review split schedule" variant="secondary" onPress={() => dispatch({ type: "SET_TAB", tab: "schedule" })} />
      </AppScreen>
    );
  }
  if (state.actorId === "maya" && state.profile.toWorkRole === "driver" && state.profile.homeRole === "driver" && state.trip.status === "options_ready") {
    return (
      <AppScreen>
        <PageHeader eyebrow="Driver availability" title="No passenger requests yet" subtitle={`Your local demo offer has ${state.profile.seats} seats and a ${state.profile.maxDetourMinutes}-minute maximum detour for both commute legs.`} />
        <Card tone="blue"><Pill label="Availability saved locally" tone="blue" /><Text style={styles.title}>You are not shown driver recommendations</Text><Text style={styles.body}>The seeded Jordan and Avery cards are driver options for the passenger journey. Switch to the seeded passenger demo to review that separate flow.</Text></Card>
        <Button label="Review your schedule" variant="secondary" onPress={() => dispatch({ type: "SET_TAB", tab: "schedule" })} />
      </AppScreen>
    );
  }
  if (state.matchScenario === "none") {
    return (
      <AppScreen>
        <PageHeader eyebrow="Tuesday · both directions" title="No coworker fits yet" subtitle="The result is complete: no opted-in driver meets every current boundary." />
        <Card tone="amber">
          <Pill label="Seeded scenario · 8:00 PM" tone="amber" />
          <Text style={styles.title}>Your commute is not confirmed</Text>
          <Text style={styles.body}>No driver can reach the 7:00 AM shift within a 15-minute schedule window and Maya’s current pickup-area boundary. Nothing was booked or shared.</Text>
        </Card>
        <SectionTitle title="Ways to recover" />
        <Button label="Demo: widen window and restore fits" onPress={() => dispatch({ type: "SET_MATCH_SCENARIO", scenario: "matches" })} />
        <Button label="Review Route 8 backup on Today" variant="secondary" onPress={() => dispatch({ type: "SET_TAB", tab: "today" })} />
        <Button label="Restore compatible demo matches" variant="quiet" onPress={() => dispatch({ type: "SET_MATCH_SCENARIO", scenario: "matches" })} />
      </AppScreen>
    );
  }
  return (
    <AppScreen>
      <PageHeader eyebrow="Tuesday · round trip" title="Coworkers who line up" subtitle="Ranked locally by seeded worksite membership, both schedule windows, route detour, and recurring availability—not popularity." />
      <Card tone="green">
        <Pill label={`${availableMatches.length} compatible ${availableMatches.length === 1 ? "fit" : "fits"}`} tone="green" />
        <Text style={styles.title}>Your home address is not shown</Text>
        <Text style={styles.body}>Before mutual acceptance, matches see only an approximate pickup area and validated compatibility facts from this fictional seed.</Text>
      </Card>
      {availableMatches.map((match) => <MatchCard key={match.id} match={match} onPress={() => dispatch({ type: "SELECT_MATCH", matchId: match.id })} />)}
      {state.trip.status !== "options_ready" ? <Text style={styles.footer}>A current request or ride is active. You can still review these options without sending another request.</Text> : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.ink, fontSize: 16, fontWeight: "900", marginTop: 10 },
  body: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  footer: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "center", margin: 12 }
});
