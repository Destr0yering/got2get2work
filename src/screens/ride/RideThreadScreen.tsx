import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen, BackButton, Button, Card, Field, PageHeader, Pill } from "../../components/primitives";
import { applyPickupOption, matches, personas } from "../../data/demoSeed";
import { useApp } from "../../state/AppContext";
import { colors, radius } from "../../theme/tokens";
import { vehicleDescription } from "../../domain/appearance";

export function RideThreadScreen() {
  const { state, dispatch } = useApp();
  const [message, setMessage] = useState("");
  const actor = personas[state.actorId];
  const baseMatch = matches.find((candidate) => candidate.id === (state.trip.activeMatchId ?? state.selectedMatchId)) ?? matches[0];
  const match = applyPickupOption(baseMatch, state.selectedPickupOptionId);
  const revealed = ["confirmed", "recovered", "completed"].includes(state.trip.status);
  const vehicleLabel = match.id === "match-jordan" ? vehicleDescription(state.appearances.jordan, "42K") : match.vehicleLabel;
  return (
    <AppScreen>
      <BackButton label="Today" onPress={() => dispatch({ type: "SET_TAB", tab: "today" })} />
      <PageHeader eyebrow="In-app ride thread" title={`${state.actorId === "maya" ? match.personName : "Maya P."} · Tuesday`} subtitle="Personal phone numbers stay hidden." />
      <Card tone={revealed ? "green" : "amber"}>
        <Pill label={revealed ? "Mutually accepted" : "Request pending"} tone={revealed ? "green" : "amber"} />
        <Text style={styles.title}>{revealed ? `${match.meetingPoint} · ${match.pickupTime} to work` : "Meeting point still private"}</Text>
        <Text style={styles.body}>{revealed ? vehicleLabel : "Only the fictional Pine & 4th area and validated seeded match facts are shared."}</Text>
        {revealed ? <Text style={styles.body}>Return: leave work {match.departureTime} · arrive back about {match.returnArrivalTime}</Text> : null}
      </Card>
      {revealed && match.id === "match-jordan" && state.trip.status === "confirmed" ? <Button label="Open pickup map & proximity" variant="secondary" onPress={() => dispatch({ type: "NAVIGATE", route: "pickup-tracker" })} /> : null}
      <Message sender="Got2Get2Work" text={revealed ? "Both coworkers agreed. The public meeting point is now available." : "Request sent using approximate area and compatibility facts."} system />
      <Message sender="Maya" text={match.id === "match-avery" ? "Thanks for offering a backup. Tuesday works for me." : "Hi! Tuesday morning works for me. I can be ready a few minutes early."} own={state.actorId === "maya"} />
      {revealed ? <Message sender={match.personName} text={`Sounds good. I’ll meet you at ${match.meetingPoint} at ${match.pickupTime}.`} own={state.actorId === "jordan" && match.id === "match-jordan"} /> : null}
      {state.rideMessages.filter((item) => item.matchId === match.id).map((item) => <Message key={item.id} sender={personas[item.senderId].firstName} text={item.text} own={item.senderId === state.actorId} />)}
      <Text style={styles.quickLabel}>Quick updates</Text>
      <View style={styles.quickRow}>
        <Button label="Running 5 minutes late" variant="quiet" onPress={() => dispatch({ type: "SEND_RIDE_MESSAGE", text: "Running 5 minutes late." })} />
        <Button label="Confirm return pickup" variant="quiet" onPress={() => dispatch({ type: "SEND_RIDE_MESSAGE", text: `Confirming our ${match.departureTime} return pickup at North Campus.` })} />
      </View>
      <Field label="Message" value={message} onChangeText={setMessage} placeholder="Write an in-app message" />
      <Button label="Save message in local thread" disabled={!message.trim()} onPress={() => { dispatch({ type: "SEND_RIDE_MESSAGE", text: message }); setMessage(""); }} />
      <Button label="Safety & help" variant="secondary" onPress={() => dispatch({ type: "NAVIGATE", route: "safety-help" })} />
    </AppScreen>
  );
}

function Message({ sender, text, own = false, system = false }: { sender: string; text: string; own?: boolean; system?: boolean }) { return <View style={[styles.messageWrap, own && styles.messageWrapOwn]}><View style={[styles.message, own && styles.messageOwn, system && styles.system]}><Text style={[styles.sender, own && styles.senderOwn]}>{sender}</Text><Text style={[styles.messageText, own && styles.messageTextOwn]}>{text}</Text></View></View>; }
const styles = StyleSheet.create({
  title: { color: colors.ink, fontSize: 17, fontWeight: "900", marginTop: 10 }, body: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  messageWrap: { alignItems: "flex-start", marginBottom: 10 }, messageWrapOwn: { alignItems: "flex-end" },
  message: { maxWidth: "88%", backgroundColor: "#ECEFF3", borderRadius: radius.md, borderBottomLeftRadius: 5, padding: 12 },
  messageOwn: { backgroundColor: colors.cobalt, borderBottomLeftRadius: radius.md, borderBottomRightRadius: 5 }, system: { backgroundColor: colors.blueSoft, borderWidth: 1, borderColor: "#CAD8F5" },
  sender: { color: colors.cobaltDark, fontSize: 10, fontWeight: "900", marginBottom: 3 }, senderOwn: { color: "#DCE6FF" },
  messageText: { color: colors.ink, fontSize: 12, lineHeight: 18 }, messageTextOwn: { color: colors.white },
  quickLabel: { color: colors.ink, fontSize: 13, fontWeight: "900", marginTop: 4 },
  quickRow: { marginBottom: 14 }
});
