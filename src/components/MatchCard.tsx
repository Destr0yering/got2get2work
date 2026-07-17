import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { MatchOption } from "../domain/models";
import { colors, radius } from "../theme/tokens";
import { Card, Pill } from "./primitives";

export function MatchCard({ match, onPress }: { match: MatchOption; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Open match with ${match.personName}`} onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <Card>
        <View style={styles.top}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{match.initials}</Text></View>
          <View style={styles.flex}>
            <Text style={styles.name}>{match.personName}</Text>
            <Text style={styles.meta}>{match.areaLabel}</Text>
          </View>
          <Pill label={match.fitLabel} tone={match.fitLabel === "Best fit" ? "green" : "blue"} />
        </View>
        <View style={styles.reasonBox}>
          <Text style={styles.reason}>Same seeded worksite · {match.overlapMinutes}-min arrival overlap</Text>
          <Text style={styles.reason}>{match.departureOverlapMinutes}-min home-departure overlap</Text>
          <Text style={styles.reason}>About {match.detourMinutes} min added to the driver’s route</Text>
        </View>
        <View style={styles.stats}>
          <Stat value={`+${match.detourMinutes} min`} label="Detour" />
          <Stat value={match.departureTime} label="Leave work" />
          <Stat value={match.suggestedRoundTripShare} label="Round-trip share" />
        </View>
        <Text style={styles.open}>Review why this match works  ›</Text>
      </Card>
    </Pressable>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.76 },
  top: { flexDirection: "row", gap: 11, alignItems: "center" },
  avatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.midnight, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.white, fontWeight: "900", fontSize: 16 },
  flex: { flex: 1 },
  name: { color: colors.ink, fontSize: 17, fontWeight: "900" },
  meta: { color: colors.muted, fontSize: 12, marginTop: 3 },
  reasonBox: { backgroundColor: colors.blueSoft, borderRadius: radius.md, padding: 12, marginTop: 14, gap: 4 },
  reason: { color: "#385181", fontSize: 12, lineHeight: 17 },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 13 },
  stat: { flexGrow: 1, flexBasis: 95, minHeight: 60, borderRadius: radius.sm, backgroundColor: colors.canvas, padding: 9, justifyContent: "center" },
  statValue: { color: colors.ink, fontWeight: "900", fontSize: 13 },
  statLabel: { color: colors.muted, fontSize: 11, lineHeight: 15, marginTop: 3 },
  open: { color: colors.cobaltDark, fontSize: 13, fontWeight: "800", marginTop: 14 }
});
