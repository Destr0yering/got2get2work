import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { PickupApproachMap } from "../../components/PickupApproachMap";
import { AppScreen, BackButton, Button, Card, PageHeader, Pill, SectionTitle } from "../../components/primitives";
import { applyPickupOption, matches, personas } from "../../data/demoSeed";
import { avatarChoice, vehicleDescription } from "../../domain/appearance";
import { useApp } from "../../state/AppContext";
import { colors } from "../../theme/tokens";

export function PickupTrackerScreen() {
  const { state, dispatch } = useApp();
  const baseMatch = matches.find((candidate) => candidate.id === (state.trip.activeMatchId ?? state.selectedMatchId)) ?? matches[0];
  const match = applyPickupOption(baseMatch, state.selectedPickupOptionId);
  const actor = personas[state.actorId];
  const counterpartId = state.actorId === "maya" ? "jordan" : "maya";
  const counterpart = personas[counterpartId];
  const ownEnabled = state.proximityOptIn[state.actorId];
  const partnerEnabled = state.proximityOptIn[counterpartId];
  const mutual = state.proximityOptIn.maya && state.proximityOptIn.jordan;
  const primaryConfirmed = state.trip.status === "confirmed" && state.trip.activeMatchId === "match-jordan";
  const vehicle = state.appearances.jordan;
  const passenger = state.appearances.maya;
  const signalFound = mutual && state.passengerAtPickup && ["nearby", "arrived"].includes(state.vehicleApproachStatus);
  const advanceLabel = state.vehicleApproachStatus === "waiting" ? "Demo: start driving to pickup"
    : state.vehicleApproachStatus === "en_route" ? "Demo: move into nearby zone"
      : state.vehicleApproachStatus === "nearby" ? "Demo: mark vehicle arrived" : "Vehicle is at pickup";

  return (
    <AppScreen>
      <BackButton label="Confirmed ride" onPress={() => dispatch({ type: "SET_TAB", tab: "today" })} />
      <PageHeader eyebrow="Pickup proximity" title={state.actorId === "maya" ? "See the car approach" : "See when Maya is waiting"} subtitle={`${match.meetingPoint} · ${match.pickupTime}`} />
      <Card tone={signalFound ? "green" : mutual ? "blue" : "amber"}>
        <Pill label="Bluetooth handoff · simulated" tone={signalFound ? "green" : mutual ? "blue" : "amber"} />
        <Text style={styles.heroTitle}>{signalFound ? "Nearby pickup signal found" : mutual ? "Both coworkers are sharing" : "Waiting for mutual opt-in"}</Text>
        <Text style={styles.body}>{signalFound ? "The demo indicates both devices are near the agreed public pickup. Confirm the person and vehicle visually before boarding." : "Each coworker enables short-range sharing separately. No stranger discovery, exact coordinate, or background tracking is used."}</Text>
      </Card>

      <PickupApproachMap
        pickup={match.meetingPoint}
        vehicleStatus={state.vehicleApproachStatus}
        passengerPresent={state.passengerAtPickup}
        sharingEnabled={mutual}
        passengerAvatarId={passenger.avatarId}
        vehicleColorId={vehicle.vehicleColorId}
        vehicleType={vehicle.vehicleType}
      />

      <SectionTitle title="Share only for this pickup" detail="Contextual, foreground, and off by default." />
      <View style={styles.permissionRow}>
        <View style={styles.flex}><Text style={styles.permissionTitle}>{actor.firstName}'s pickup proximity</Text><Text style={styles.permissionDetail}>{ownEnabled ? "Enabled for this fictional confirmed ride" : "Off · no Bluetooth signal shared"}</Text></View>
        <Switch accessibilityLabel={`Enable pickup proximity for ${actor.firstName}`} disabled={!primaryConfirmed} value={ownEnabled} onValueChange={(enabled) => dispatch({ type: "SET_PROXIMITY_OPT_IN", enabled })} trackColor={{ false: "#C8D0D9", true: "#73C8AD" }} thumbColor={ownEnabled ? colors.kind : colors.white} />
      </View>
      {!partnerEnabled ? <Card tone="amber"><Text style={styles.cardTitle}>{counterpart.firstName} has not enabled sharing</Text><Text style={styles.body}>Switch the demo to {counterpart.firstName} so that coworker can make a separate choice.</Text><Button label={`Switch demo to ${counterpart.firstName}`} variant="secondary" onPress={() => dispatch({ type: "SWITCH_ACTOR", actorId: counterpartId })} /></Card> : null}

      {mutual && state.actorId === "maya" ? <Button label={state.passengerAtPickup ? "Stop sharing that I am at pickup" : "Demo: I am standing at pickup"} variant={state.passengerAtPickup ? "secondary" : "primary"} onPress={() => dispatch({ type: "SET_PASSENGER_AT_PICKUP", present: !state.passengerAtPickup })} /> : null}
      {mutual && state.actorId === "jordan" ? <Button label={advanceLabel} disabled={state.vehicleApproachStatus === "arrived"} onPress={() => dispatch({ type: "ADVANCE_VEHICLE_APPROACH" })} /> : null}
      {mutual ? <Button label={`Demo: view as ${counterpart.firstName}`} variant="quiet" onPress={() => dispatch({ type: "SWITCH_ACTOR", actorId: counterpartId })} /> : null}

      <Card>
        <Text style={styles.cardTitle}>Recognition check</Text>
        <Text style={styles.body}>Passenger avatar: {avatarChoice(passenger.avatarId).label} · Driver vehicle: {vehicleDescription(vehicle, "42K")}.</Text>
        <Text style={styles.body}>Bluetooth proximity is only an extra cue. Coworkers should verify the agreed avatar, vehicle description, public meeting point, and in-app message.</Text>
      </Card>
      <Card tone="blue"><Text style={styles.cardTitle}>Production design boundary</Text><Text style={styles.body}>A native build would exchange an encrypted, rotating ride token and convert signal strength into broad “nearby” states. Tokens expire after pickup; raw Bluetooth identifiers and continuous movement histories should not be retained.</Text></Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heroTitle: { color: colors.ink, fontSize: 19, lineHeight: 25, fontWeight: "900", marginTop: 10 },
  body: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  permissionRow: { minHeight: 78, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 16 },
  flex: { flex: 1 },
  permissionTitle: { color: colors.ink, fontSize: 14, fontWeight: "900" },
  permissionDetail: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  cardTitle: { color: colors.ink, fontSize: 15, fontWeight: "900" }
});
