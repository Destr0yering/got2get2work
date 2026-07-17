import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen, Button, Card, PageHeader, Pill, SectionTitle } from "../../components/primitives";
import { applyPickupOption, impactSummary, matches, personas } from "../../data/demoSeed";
import { tripStatusLabel } from "../../domain/tripMachine";
import { useApp } from "../../state/AppContext";
import { colors, radius } from "../../theme/tokens";
import { ConfirmedRideScreen } from "./ConfirmedRideScreen";

export function TodayScreen() {
  const { state, dispatch } = useApp();
  const actor = personas[state.actorId];
  const baseSelected = matches.find((match) => match.id === (state.trip.activeMatchId ?? state.selectedMatchId)) ?? matches[0];
  const selected = applyPickupOption(baseSelected, state.selectedPickupOptionId);
  if (state.actorId === "jordan") return <DriverToday />;
  if (state.profile.toWorkRole !== state.profile.homeRole && ["needs_plan", "options_ready"].includes(state.trip.status)) return <MixedPlanToday />;
  if (state.profile.toWorkRole === "driver" && state.profile.homeRole === "driver" && ["needs_plan", "options_ready"].includes(state.trip.status)) return <MayaDriverToday />;
  return (
    <AppScreen testID="today-screen">
      <PageHeader eyebrow="Tuesday · July 21" title={`Good morning, ${actor.firstName}`} subtitle="Your next shift starts at 7:00 AM at North Campus." />
      {state.trip.status === "confirmed" || state.trip.status === "recovered" ? <ConfirmedRideScreen match={selected} status={state.trip.status} /> : null}
      {state.trip.status === "options_ready" || state.trip.status === "needs_plan" ? (
        <>
          <Card tone="dark">
            <View style={styles.rowBetween}>
              <View style={styles.flexMin}>
                <Text style={styles.darkEyebrow}>NEXT SHIFT</Text>
                <Text style={styles.darkTitle}>7:00 AM–3:30 PM</Text>
                <Text style={styles.darkSub}>Northstar Fulfillment · North Campus</Text>
              </View>
              <Pill label={tripStatusLabel(state.trip.status)} tone={state.trip.status === "options_ready" ? "green" : "amber"} />
            </View>
            <View style={styles.leaveBox}><Text style={styles.leaveLabel}>Recommended leave window</Text><Text style={styles.leaveValue}>6:15–6:25 AM</Text></View>
          </Card>
          {state.matchScenario === "matches" ? (
            <Card tone="blue">
              <Pill label="Local round-trip recommendation" tone="blue" />
              <Text style={styles.cardTitle}>2 good coworker fits</Text>
              <Text style={styles.cardBody}>Jordan is the strongest seeded fit: 8-minute arrival overlap, 12-minute home-departure overlap, and about a 5-minute detour.</Text>
              <Button label="Review round-trip matches" onPress={() => dispatch({ type: "SET_TAB", tab: "matches" })} />
            </Card>
          ) : (
            <Card tone="amber">
              <Pill label="No coworker fit yet" tone="amber" />
              <Text style={styles.cardTitle}>Your commute is not confirmed</Text>
              <Text style={styles.cardBody}>No opted-in driver meets every current boundary. Review why, widen the window, or use the unbooked Route 8 backup.</Text>
              <Button label="Review no-match options" onPress={() => dispatch({ type: "SET_TAB", tab: "matches" })} />
            </Card>
          )}
          <SectionTitle title="Your backup ladder" detail="Nothing is booked automatically." />
          <Card>
            <BackupRow number="1" title="Compatible coworker" detail={state.matchScenario === "matches" ? "2 matches available" : "No current fit"} />
            <BackupRow number="2" title="Route 8 transit" detail="6:03 AM · 47 minutes" />
            <BackupRow number="3" title="Rideshare estimate" detail="$18–24 · not booked" last />
          </Card>
        </>
      ) : null}
      {state.trip.status === "request_pending" ? (
        <>
          <Card tone="amber">
            <Pill label="Request pending" tone="amber" />
            <Text style={styles.cardTitle}>Waiting for Jordan</Text>
            <Text style={styles.cardBody}>Jordan received both schedule overlaps, approximate pickup area, detour, and {selected.suggestedRoundTripShare} round-trip share. Your exact meeting point is still hidden.</Text>
            <Button label="Open request thread" onPress={() => dispatch({ type: "NAVIGATE", route: "ride-thread" })} />
          </Card>
          <Card tone="blue">
            <Text style={styles.cardTitle}>Demo next step</Text>
            <Text style={styles.cardBody}>Switch to Jordan to review and accept the request as the driver.</Text>
            <Button label="Switch demo to Jordan" variant="quiet" onPress={() => dispatch({ type: "SWITCH_ACTOR", actorId: "jordan" })} />
          </Card>
        </>
      ) : null}
      {state.trip.status === "cancelled" ? (
        <Card tone="red">
          <Pill label="Ride changed" tone="red" />
          <Text style={styles.cardTitle}>Jordan had to cancel</Text>
          <Text style={styles.cardBody}>Your Tuesday shift is not stranded. Got2Get2Work found Avery as a compatible backup and kept transit ready.</Text>
          <Button label="Review backup plan" variant="danger" onPress={() => dispatch({ type: "OPEN_RECOVERY" })} />
        </Card>
      ) : null}
      {state.trip.status === "recovery_ready" ? (
        <Card tone="amber">
          <Pill label="Backup awaiting you" tone="amber" />
          <Text style={styles.cardTitle}>Avery’s standing offer is ready to review</Text>
          <Text style={styles.cardBody}>Nothing changed when you left the recovery screen. Review the deterministic fit and accept only if the plan works for you.</Text>
          <Button label="Resume backup review" onPress={() => dispatch({ type: "NAVIGATE", route: "recovery" })} />
        </Card>
      ) : null}
      {state.trip.status === "completed" ? (
        <>
          <Card tone="green"><Pill label="Commute complete" tone="green" /><Text style={styles.cardTitle}>Your shift stayed connected</Text><Text style={styles.cardBody}>The ride was completed without sharing a home address.</Text></Card>
          <SectionTitle title={`Plan another commute with ${selected.personName}?`} detail="These controls update local demo matching preferences." />
          <Card>
            <Button label="Ride together again" onPress={() => dispatch({ type: "SET_RELATIONSHIP_PREFERENCE", preference: "again" })} />
            <Button label="Prefer this coworker" variant="secondary" onPress={() => dispatch({ type: "SET_RELATIONSHIP_PREFERENCE", preference: "preferred" })} />
            <Button label="Do not match us again" variant="quiet" onPress={() => dispatch({ type: "SET_RELATIONSHIP_PREFERENCE", preference: "blocked" })} />
          </Card>
          <SectionTitle title="Estimated monthly impact" />
          <View style={styles.impactRow}>
            <Impact value={String(impactSummary.shiftsCovered)} label="Shifts covered" />
            <Impact value={impactSummary.monthlySavings} label="Potential savings" />
            <Impact value={String(impactSummary.fewerSoloTrips)} label="Fewer solo trips" />
          </View>
        </>
      ) : null}
    </AppScreen>
  );
}

function MixedPlanToday() {
  const { state, dispatch } = useApp();
  return (
    <AppScreen testID="today-screen">
      <PageHeader eyebrow="Tuesday · split commute" title="Each commute leg has its own role" subtitle="Got2Get2Work keeps the trip to work separate from the trip home." />
      <Card tone="blue">
        <Pill label="Two independent plans" tone="blue" />
        <Text style={styles.cardTitle}>To work · {state.profile.toWorkRole === "passenger" ? "Need a ride" : "Can drive"}</Text>
        <Text style={styles.cardBody}>Before 7:00 AM · North Campus</Text>
        <Text style={styles.cardTitle}>Home · {state.profile.homeRole === "passenger" ? "Need a ride" : "Can drive"}</Text>
        <Text style={styles.cardBody}>After 3:30 PM · North Campus</Text>
      </Card>
      <Card tone="amber"><Text style={styles.cardTitle}>No single round trip recommended</Text><Text style={styles.cardBody}>The seeded round-trip drivers assume Maya needs a ride both ways. Your split-role plan stays separate instead of silently changing either leg.</Text></Card>
      <Button label="Review split schedule" onPress={() => dispatch({ type: "SET_TAB", tab: "schedule" })} />
    </AppScreen>
  );
}

function MayaDriverToday() {
  const { state, dispatch } = useApp();
  return (
    <AppScreen testID="today-screen">
      <PageHeader eyebrow="Tuesday · driver plan" title="Your driver availability is ready" subtitle="The local demo will never show you driver recommendations while your role is set to drive." />
      <Card tone="dark">
        <Pill label="Availability saved locally" tone="green" />
        <Text style={styles.darkTitle}>{state.profile.seats} seats · up to {state.profile.maxDetourMinutes} min detour</Text>
        <Text style={styles.darkSub}>To work before 7:00 AM · home after 3:30 PM · North Campus</Text>
      </Card>
      <Card tone="blue">
        <Text style={styles.cardTitle}>No passenger requests yet</Text>
        <Text style={styles.cardBody}>Your limits are active in this fictional driver scenario. No coworker has been contacted, and no ride or payment is created automatically.</Text>
        <Button label="Review driver schedule" onPress={() => dispatch({ type: "SET_TAB", tab: "schedule" })} />
      </Card>
      <SectionTitle title="While you wait" detail="You remain in control of every request." />
      <Card><BackupRow number="1" title="Passenger request" detail="None yet" /><BackupRow number="2" title="Change availability" detail="Profile → Edit commute profile" last /></Card>
    </AppScreen>
  );
}

function DriverToday() {
  const { state, dispatch } = useApp();
  const baseMatch = matches.find((match) => match.id === (state.trip.activeMatchId ?? state.selectedMatchId)) ?? matches[0];
  const match = applyPickupOption(baseMatch, state.selectedPickupOptionId);
  return (
    <AppScreen>
      <PageHeader eyebrow="Driver demo" title="Good morning, Jordan" subtitle="Your next shift starts at 7:00 AM at North Campus." />
      {state.trip.status === "request_pending" ? (
        <Card tone="blue">
          <View style={styles.rowBetween}><Pill label="New request" tone="blue" /><Text style={styles.timeStamp}>Just now</Text></View>
          <Text style={styles.cardTitle}>Maya P. needs a ride</Text>
          <Text style={styles.cardBody}>Same seeded worksite · morning pickup adds about {match.detourMinutes} minutes · round-trip share {match.suggestedRoundTripShare}.</Text>
          <View style={styles.driverStats}>
            <DriverStat value={match.pickupTime} label="To-work pickup" />
            <DriverStat value={match.departureTime} label="Leave work" />
            <DriverStat value={match.suggestedRoundTripShare} label="Round-trip share" />
          </View>
          <Text style={styles.privacyLine}>This seeded route does not use Maya’s entered location. Jordan sees a fictional broader “Pine & 4th area” label; the selected public meeting point unlocks only after acceptance.</Text>
          <Button label="Accept coworker ride" onPress={() => dispatch({ type: "ACCEPT_REQUEST" })} />
          <Button label="Review request details" variant="secondary" onPress={() => dispatch({ type: "NAVIGATE", route: "ride-thread" })} />
        </Card>
      ) : null}
      {state.trip.status === "confirmed" ? (
        <Card tone="green">
          <Pill label="Accepted" tone="green" />
          <Text style={styles.cardTitle}>Maya’s ride is confirmed</Text>
          <Text style={styles.cardBody}>Meet at {match.meetingPoint} at {match.pickupTime}. Return pickup is {match.departureTime} at North Campus. Both coworkers now see the same plan.</Text>
          <Button label="Open pickup map & proximity" onPress={() => dispatch({ type: "NAVIGATE", route: "pickup-tracker" })} />
          <Button label="Switch back to Maya" onPress={() => dispatch({ type: "SWITCH_ACTOR", actorId: "maya" })} />
        </Card>
      ) : null}
    </AppScreen>
  );
}

function BackupRow({ number, title, detail, last = false }: { number: string; title: string; detail: string; last?: boolean }) {
  return <View style={[styles.backupRow, last && styles.noBorder]}><View style={styles.backupNumber}><Text style={styles.backupNumberText}>{number}</Text></View><View style={styles.flex}><Text style={styles.backupTitle}>{title}</Text><Text style={styles.backupDetail}>{detail}</Text></View></View>;
}

function Impact({ value, label }: { value: string; label: string }) {
  return <View style={styles.impact}><Text style={styles.impactValue}>{value}</Text><Text style={styles.impactLabel}>{label}</Text></View>;
}

function DriverStat({ value, label }: { value: string; label: string }) {
  return <View style={styles.driverStat}><Text style={styles.driverStatValue}>{value}</Text><Text style={styles.driverStatLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  flexMin: { flex: 1, minWidth: 180 },
  darkEyebrow: { color: "#92A8CA", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  darkTitle: { color: colors.white, fontSize: 24, fontWeight: "900", marginTop: 6 },
  darkSub: { color: "#B2C0D6", fontSize: 12, marginTop: 4 },
  leaveBox: { backgroundColor: colors.midnightSoft, borderRadius: radius.md, padding: 13, marginTop: 18 },
  leaveLabel: { color: "#93A5C0", fontSize: 10, fontWeight: "800" },
  leaveValue: { color: colors.white, fontSize: 19, fontWeight: "900", marginTop: 3 },
  cardTitle: { color: colors.ink, fontSize: 20, lineHeight: 26, fontWeight: "900", marginTop: 11 },
  cardBody: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 6 },
  backupRow: { minHeight: 66, flexDirection: "row", gap: 11, alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.border },
  noBorder: { borderBottomWidth: 0 },
  backupNumber: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.blueSoft, alignItems: "center", justifyContent: "center" },
  backupNumberText: { color: colors.cobaltDark, fontWeight: "900" },
  backupTitle: { color: colors.ink, fontWeight: "800", fontSize: 13 },
  backupDetail: { color: colors.muted, fontSize: 11, marginTop: 3 },
  flex: { flex: 1 },
  impactRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  impact: { flexGrow: 1, flexBasis: 100, minHeight: 92, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 11, justifyContent: "center" },
  impactValue: { color: colors.kind, fontSize: 23, fontWeight: "900" },
  impactLabel: { color: colors.muted, fontSize: 11, lineHeight: 15, marginTop: 4 },
  timeStamp: { color: colors.muted, fontSize: 11 },
  driverStats: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 14 },
  driverStat: { flexGrow: 1, flexBasis: 100, backgroundColor: colors.surface, borderRadius: radius.sm, padding: 9 },
  driverStatValue: { color: colors.ink, fontSize: 13, fontWeight: "900" },
  driverStatLabel: { color: colors.muted, fontSize: 11, lineHeight: 15, marginTop: 3 },
  privacyLine: { color: "#385181", backgroundColor: colors.blueSoft, borderRadius: radius.sm, padding: 11, fontSize: 11, lineHeight: 17, marginTop: 12 }
});
