import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen, Button, Card, PageHeader, Pill } from "../../components/primitives";
import { useApp } from "../../state/AppContext";
import { colors } from "../../theme/tokens";

export function BetaTodayScreen() {
  const { betaRequests, refreshBetaRequests, acceptBetaRequest } = useApp();
  useEffect(() => { void refreshBetaRequests(); }, []);
  return (
    <AppScreen testID="beta-today-screen">
      <PageHeader eyebrow="Closed beta" title="Your real commute requests" subtitle="Requests come from authenticated beta members. Both people must agree before public meeting details are added." />
      <Button label="Refresh requests" variant="secondary" onPress={() => void refreshBetaRequests()} />
      {betaRequests.length === 0 ? <Card tone="blue"><Pill label="No requests yet" tone="blue" /><Text style={styles.title}>Your beta community is quiet</Text><Text style={styles.body}>Complete your profile and schedule, then use Matches to find another tester. Nothing is simulated here.</Text></Card> : null}
      {betaRequests.map((request) => {
        const incoming = request.direction === "incoming";
        const name = incoming ? request.requesterName : request.recipientName;
        return <Card key={`${request.direction}-${request.id}`} tone={request.status === "accepted" ? "green" : "plain"}>
          <View style={styles.row}><Pill label={incoming ? "Incoming" : "Sent"} tone={incoming ? "amber" : "blue"} /><Pill label={request.status} tone={request.status === "accepted" ? "green" : "neutral"} /></View>
          <Text style={styles.title}>{incoming ? `${name} wants to coordinate` : `Request to ${name}`}</Text>
          <Text style={styles.body}>{request.sharedDays.join(", ")} · {request.toWorkCompatible ? "to work" : ""}{request.toWorkCompatible && request.homeCompatible ? " + " : ""}{request.homeCompatible ? "home" : ""}</Text>
          {incoming && request.status === "pending" ? <Button label={`Accept ${name}'s request`} onPress={() => void acceptBetaRequest(request.id)} /> : null}
          {request.status === "accepted" ? <Text style={styles.accepted}>Accepted · public meeting-point coordination is the next required step.</Text> : null}
        </Card>;
      })}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  title: { color: colors.ink, fontSize: 18, fontWeight: "900", marginTop: 12 },
  body: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 5 },
  accepted: { color: colors.kind, fontSize: 12, lineHeight: 18, fontWeight: "800", marginTop: 12 },
});
