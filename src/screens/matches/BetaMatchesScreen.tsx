import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AppScreen, Button, Card, PageHeader, Pill } from "../../components/primitives";
import { useApp } from "../../state/AppContext";
import { colors } from "../../theme/tokens";

export function BetaMatchesScreen() {
  const { betaMatches, betaMatchesBusy, refreshBetaMatches, sendBetaRequest } = useApp();
  useEffect(() => { void refreshBetaMatches(); }, []);
  return (
    <AppScreen testID="beta-matches-screen">
      <PageHeader eyebrow="Private beta community" title="Real commute matches" subtitle="These are authenticated testers with opposite commute roles and overlapping shift days. Route feasibility is never assumed." />
      <Button label="Refresh matches" variant="secondary" busy={betaMatchesBusy} onPress={() => void refreshBetaMatches()} />
      {betaMatchesBusy && betaMatches.length === 0 ? <ActivityIndicator color={colors.cobalt} style={styles.loading} /> : null}
      {!betaMatchesBusy && betaMatches.length === 0 ? <Card tone="blue"><Pill label="Waiting for your community" tone="blue" /><Text style={styles.title}>No compatible beta members yet</Text><Text style={styles.body}>Invite a second tester with the opposite Driver/Passenger role and at least one shared shift day. This screen will not substitute fictional people.</Text></Card> : null}
      {betaMatches.map((match) => <Card key={match.userId}>
        <View style={styles.row}><View style={styles.avatar}><Text style={styles.avatarText}>{match.displayName.slice(0, 1).toUpperCase()}</Text></View><View style={styles.flex}><Text style={styles.title}>{match.displayName}</Text><Text style={styles.body}>{match.areaLabel} · {match.sharedDays.join(", ")}</Text></View></View>
        <View style={styles.pills}>{match.toWorkCompatible ? <Pill label="To work" tone="green" /> : null}{match.homeCompatible ? <Pill label="Home" tone="green" /> : null}<Pill label="Route review needed" tone="amber" /></View>
        <Text style={styles.note}>{match.seats > 0 ? `${match.seats} seats · up to ${match.maxDetourMinutes} min detour` : "Passenger request"}. Exact meeting details remain hidden.</Text>
        <Button label={`Request a commute with ${match.displayName}`} onPress={() => void sendBetaRequest(match.userId)} />
      </Card>)}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 30 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  flex: { flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.kindSoft, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.kind, fontSize: 18, fontWeight: "900" },
  title: { color: colors.ink, fontSize: 17, fontWeight: "900", marginTop: 9 },
  body: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 14 },
  note: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 11 },
});
