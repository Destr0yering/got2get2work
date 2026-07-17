import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius } from "../theme/tokens";

export function RouteSketch({ pickup, worksite, detourMinutes }: { pickup: string; worksite: string; detourMinutes: number }) {
  return (
    <View>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Route summary: driver route passes ${pickup} and continues to ${worksite}. Estimated added detour is ${detourMinutes} minutes.`}
        style={styles.map}
      >
        <View style={[styles.road, styles.roadOne]} />
        <View style={[styles.road, styles.roadTwo]} />
        <View style={styles.routeOne} />
        <View style={styles.routeTwo} />
        <Marker label="Driver" left="8%" top={34} tone="dark" />
        <Marker label="Pickup area" left="43%" top={82} tone="blue" />
        <Marker label="Work" left="76%" top={132} tone="green" />
      </View>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>Approximate route only</Text>
        <Text style={styles.summaryText}>+{detourMinutes} min detour</Text>
      </View>
    </View>
  );
}

function Marker({ label, left, top, tone }: { label: string; left: `${number}%`; top: number; tone: "dark" | "blue" | "green" }) {
  const backgroundColor = tone === "dark" ? colors.midnight : tone === "green" ? colors.kind : colors.cobalt;
  return (
    <View style={[styles.markerWrap, { left, top }]}>
      <View style={[styles.marker, { backgroundColor }]}><View style={styles.markerDot} /></View>
      <Text style={styles.markerLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { height: 205, borderRadius: radius.lg, overflow: "hidden", backgroundColor: "#E8ECE8", borderWidth: 1, borderColor: colors.border, position: "relative" },
  road: { position: "absolute", height: 16, width: "125%", left: -30, backgroundColor: colors.white, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#D7DED8" },
  roadOne: { top: 57, transform: [{ rotate: "-10deg" }] },
  roadTwo: { top: 141, transform: [{ rotate: "12deg" }] },
  routeOne: { position: "absolute", height: 6, width: "47%", top: 72, left: "12%", borderRadius: 3, backgroundColor: colors.cobalt, transform: [{ rotate: "23deg" }] },
  routeTwo: { position: "absolute", height: 6, width: "42%", top: 124, left: "48%", borderRadius: 3, backgroundColor: colors.cobalt, transform: [{ rotate: "18deg" }] },
  markerWrap: { position: "absolute", alignItems: "center", width: 68, marginLeft: -34 },
  marker: { width: 29, height: 29, borderRadius: 15, borderWidth: 3, borderColor: colors.white, alignItems: "center", justifyContent: "center", elevation: 2 },
  markerDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.white },
  markerLabel: { color: colors.ink, backgroundColor: "rgba(255,255,255,0.93)", paddingHorizontal: 5, paddingVertical: 3, borderRadius: 6, fontSize: 10, fontWeight: "900", marginTop: 3, textAlign: "center" },
  summary: { flexDirection: "row", justifyContent: "space-between", backgroundColor: colors.midnight, paddingHorizontal: 13, paddingVertical: 10, borderRadius: radius.sm, marginTop: 8 },
  summaryText: { color: colors.white, fontSize: 11, fontWeight: "800" }
});
