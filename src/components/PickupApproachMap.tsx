import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { avatarChoice, vehicleColorChoice, vehicleIcon } from "../domain/appearance";
import { AvatarId, VehicleApproachStatus, VehicleColorId, VehicleType } from "../domain/models";
import { colors, radius } from "../theme/tokens";

const vehicleLeft: Record<VehicleApproachStatus, `${number}%`> = {
  waiting: "7%",
  en_route: "27%",
  nearby: "55%",
  arrived: "72%"
};

const statusCopy: Record<VehicleApproachStatus, string> = {
  waiting: "Not moving yet",
  en_route: "About 5 minutes away",
  nearby: "Nearby · under 1 minute",
  arrived: "At the pickup point"
};

export function PickupApproachMap({
  pickup,
  vehicleStatus,
  passengerPresent,
  sharingEnabled,
  passengerAvatarId,
  vehicleColorId,
  vehicleType
}: {
  pickup: string;
  vehicleStatus: VehicleApproachStatus;
  passengerPresent: boolean;
  sharingEnabled: boolean;
  passengerAvatarId: AvatarId;
  vehicleColorId: VehicleColorId;
  vehicleType: VehicleType;
}) {
  const carColor = vehicleColorChoice(vehicleColorId).hex;
  const passenger = avatarChoice(passengerAvatarId);
  const accessibleStatus = sharingEnabled ? statusCopy[vehicleStatus] : "proximity sharing is off";
  return (
    <View>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Approximate pickup map for ${pickup}. Vehicle status: ${accessibleStatus}. Passenger pickup presence: ${passengerPresent && sharingEnabled ? "shared" : "not shared"}.`}
        style={styles.map}
      >
        <View style={[styles.block, styles.blockOne]} />
        <View style={[styles.block, styles.blockTwo]} />
        <View style={[styles.road, styles.roadOne]} />
        <View style={[styles.road, styles.roadTwo]} />
        <View style={styles.route} />
        <View style={[styles.meetingHalo, { opacity: sharingEnabled ? 1 : 0.55 }]} />
        <View style={styles.meetingPin}><Text style={styles.pinText}>P</Text></View>
        <Text style={styles.meetingLabel}>Public pickup</Text>
        <View style={[styles.carWrap, { left: sharingEnabled ? vehicleLeft[vehicleStatus] : "7%", opacity: sharingEnabled ? 1 : 0.42 }]}>
          <View style={[styles.car, { backgroundColor: carColor }]}><Text style={styles.carIcon}>{vehicleIcon(vehicleType)}</Text></View>
          <Text style={styles.markerLabel}>{sharingEnabled ? "Driver" : "Hidden"}</Text>
        </View>
        <View style={[styles.personWrap, { opacity: sharingEnabled && passengerPresent ? 1 : 0.25 }]}>
          <View style={styles.person}><Text style={styles.personIcon}>{passenger.symbol}</Text></View>
          <Text style={styles.markerLabel}>{sharingEnabled && passengerPresent ? "Passenger here" : "Not shared"}</Text>
        </View>
      </View>
      <View style={styles.summary}>
        <Text style={styles.summaryStrong}>{sharingEnabled ? statusCopy[vehicleStatus] : "Waiting for mutual opt-in"}</Text>
        <Text style={styles.summaryText}>Approximate demo map</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { height: 222, borderRadius: radius.lg, overflow: "hidden", backgroundColor: "#E9EFE9", borderWidth: 1, borderColor: colors.border, position: "relative" },
  block: { position: "absolute", backgroundColor: "#DCE6DC", borderRadius: 8 },
  blockOne: { width: 92, height: 48, left: 18, top: 16 },
  blockTwo: { width: 112, height: 54, right: 16, bottom: 15 },
  road: { position: "absolute", height: 28, width: "125%", left: -28, backgroundColor: colors.white, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#D1DAD2" },
  roadOne: { top: 95, transform: [{ rotate: "-7deg" }] },
  roadTwo: { top: 151, transform: [{ rotate: "16deg" }] },
  route: { position: "absolute", height: 6, width: "75%", top: 117, left: "8%", borderRadius: 4, backgroundColor: colors.cobalt, transform: [{ rotate: "-7deg" }] },
  meetingHalo: { position: "absolute", width: 56, height: 56, borderRadius: 28, left: "71%", top: 81, backgroundColor: "rgba(22,138,104,0.18)", borderWidth: 1, borderColor: "rgba(22,138,104,0.38)" },
  meetingPin: { position: "absolute", left: "77%", top: 93, width: 31, height: 31, borderRadius: 16, backgroundColor: colors.kind, borderWidth: 3, borderColor: colors.white, alignItems: "center", justifyContent: "center" },
  pinText: { color: colors.white, fontWeight: "900", fontSize: 12 },
  meetingLabel: { position: "absolute", right: 7, top: 132, color: colors.ink, backgroundColor: "rgba(255,255,255,0.94)", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, fontSize: 9, fontWeight: "900" },
  carWrap: { position: "absolute", top: 91, width: 68, marginLeft: -28, alignItems: "center" },
  car: { width: 43, height: 30, borderRadius: 10, borderWidth: 3, borderColor: colors.white, alignItems: "center", justifyContent: "center", elevation: 3 },
  carIcon: { color: colors.white, fontSize: 18, fontWeight: "900" },
  personWrap: { position: "absolute", left: "72%", top: 25, width: 82, alignItems: "center" },
  person: { width: 37, height: 37, borderRadius: 19, backgroundColor: colors.midnight, borderWidth: 3, borderColor: colors.white, alignItems: "center", justifyContent: "center" },
  personIcon: { color: colors.white, fontSize: 19, fontWeight: "900" },
  markerLabel: { color: colors.ink, backgroundColor: "rgba(255,255,255,0.95)", paddingHorizontal: 5, paddingVertical: 3, borderRadius: 6, fontSize: 9, fontWeight: "900", marginTop: 3, textAlign: "center" },
  summary: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 7, backgroundColor: colors.midnight, paddingHorizontal: 13, paddingVertical: 11, borderRadius: radius.sm, marginTop: 8 },
  summaryStrong: { color: colors.white, fontSize: 11, fontWeight: "900" },
  summaryText: { color: "#B7C5DA", fontSize: 10, fontWeight: "800" }
});
