import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen, BackButton, Button, Card, PageHeader, Pill, SectionTitle } from "../../components/primitives";
import { matches } from "../../data/demoSeed";
import { useApp } from "../../state/AppContext";
import { colors, radius } from "../../theme/tokens";

export function RecoveryScreen() {
  const { dispatch } = useApp();
  const backup = matches[1];
  const hasStandingOffer = backup.standingBackupOffer === true;
  return (
    <AppScreen>
      <BackButton label="Today — keep backup ready" onPress={() => dispatch({ type: "SET_TAB", tab: "today" })} />
      <PageHeader eyebrow="Agentic recovery" title="Your shift still has a way there" subtitle="Jordan cancelled. Got2Get2Work checked coworkers who had already opted in for this shift." />
      <Card tone="red"><Pill label="Primary ride cancelled" tone="red" /><Text style={styles.cardTitle}>No personal data was reshared</Text><Text style={styles.body}>The agent used your existing commute window and deterministic reason codes. It did not contact or confirm anyone automatically.</Text></Card>
      <SectionTitle title="Active backup offer" />
      <Card tone="green">
        <View style={styles.top}><View style={styles.avatar}><Text style={styles.avatarText}>{backup.initials}</Text></View><View style={styles.flex}><Text style={styles.name}>{backup.personName}</Text><Text style={styles.meta}>{backup.areaLabel}</Text></View><Pill label={hasStandingOffer ? "Standing offer" : "Review only"} tone={hasStandingOffer ? "green" : "amber"} /></View>
        <View style={styles.stats}><Stat value={backup.pickupTime} label="To-work pickup" /><Stat value={backup.departureTime} label="Leave work" /><Stat value={backup.suggestedRoundTripShare} label="Round-trip share" /></View>
        <Text style={styles.reason}>Same seeded workplace · {backup.overlapMinutes}-minute arrival overlap · {backup.departureOverlapMinutes}-minute home overlap · public pickup area</Text>
        <Text style={styles.body}>Avery previously opted in and left a standing backup offer for this commute window. Accepting it completes mutual consent.</Text>
        <Button label="Accept Avery’s standing backup offer" disabled={!hasStandingOffer} onPress={() => dispatch({ type: "ACCEPT_BACKUP_OFFER" })} />
      </Card>
      <SectionTitle title="Fallback if Avery cannot help" />
      <Card>
        <Text style={styles.name}>Route 8 + 6-minute walk</Text>
        <Text style={styles.body}>Depart 6:03 AM · arrive 6:50 AM · transit status is a seeded demo estimate.</Text>
      </Card>
      <Text style={styles.disclaimer}>The agent suggests; both coworkers decide. No ride is accepted, cancelled, or paid for without consent.</Text>
    </AppScreen>
  );
}

function Stat({ value, label }: { value: string; label: string }) { return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }
const styles = StyleSheet.create({
  cardTitle: { color: colors.ink, fontSize: 18, fontWeight: "900", marginTop: 10 },
  body: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  top: { flexDirection: "row", gap: 11, alignItems: "center" },
  avatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.kind, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.white, fontWeight: "900" },
  flex: { flex: 1 }, name: { color: colors.ink, fontSize: 17, fontWeight: "900" }, meta: { color: colors.muted, fontSize: 11, marginTop: 3 },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 14 },
  stat: { flexGrow: 1, flexBasis: 95, backgroundColor: colors.surface, borderRadius: radius.sm, padding: 9 },
  statValue: { color: colors.ink, fontSize: 13, fontWeight: "900" }, statLabel: { color: colors.muted, fontSize: 11, lineHeight: 15, marginTop: 3 },
  reason: { color: "#316A5C", fontSize: 11, lineHeight: 17, marginTop: 12 },
  disclaimer: { color: colors.muted, fontSize: 10, lineHeight: 15, textAlign: "center", margin: 13 }
});
