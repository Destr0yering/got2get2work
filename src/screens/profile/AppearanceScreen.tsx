import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppScreen, BackButton, Button, Card, Field, PageHeader, Pill, SectionTitle } from "../../components/primitives";
import { personas } from "../../data/demoSeed";
import { avatarChoice, avatarChoices, vehicleColorChoice, vehicleColorChoices, vehicleDescription, vehicleIcon, vehicleTypeChoices } from "../../domain/appearance";
import { AvatarId, VehicleColorId, VehicleType } from "../../domain/models";
import { useApp } from "../../state/AppContext";
import { colors, radius } from "../../theme/tokens";

export function AppearanceScreen() {
  const { state, dispatch } = useApp();
  const actor = personas[state.actorId];
  const saved = state.appearances[state.actorId];
  const [avatarId, setAvatarId] = useState<AvatarId>(saved.avatarId);
  const [vehicleColorId, setVehicleColorId] = useState<VehicleColorId>(saved.vehicleColorId);
  const [vehicleType, setVehicleType] = useState<VehicleType>(saved.vehicleType);
  const [vehicleNickname, setVehicleNickname] = useState(saved.vehicleNickname);
  const avatar = avatarChoice(avatarId);
  const carColor = vehicleColorChoice(vehicleColorId);

  return (
    <AppScreen>
      <BackButton label="Profile" onPress={() => dispatch({ type: "SET_TAB", tab: "profile" })} />
      <PageHeader eyebrow="Pickup identity" title={`Make ${actor.firstName} easy to recognize`} subtitle="Choose an avatar and vehicle description. Coworkers see them only at the appropriate point in the ride flow." />
      <Card tone="dark">
        <View style={styles.preview}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{avatar.symbol}</Text></View>
          <View style={styles.previewText}><Pill label="Preview" tone="blue" /><Text style={styles.previewName}>{actor.firstName}</Text><Text style={styles.previewDetail}>{vehicleDescription({ avatarId, vehicleColorId, vehicleType, vehicleNickname: vehicleNickname || "My car" })}</Text></View>
          <View style={[styles.car, { backgroundColor: carColor.hex }]}><Text style={styles.carIcon}>{vehicleIcon(vehicleType)}</Text></View>
        </View>
      </Card>

      <SectionTitle title="Avatar" detail="A visual cue—not a verified photograph or identity check." />
      <View style={styles.optionGrid}>{avatarChoices.map((choice) => (
        <Choice key={choice.id} label={choice.label} selected={choice.id === avatarId} onPress={() => setAvatarId(choice.id)}>
          <Text style={styles.choiceSymbol}>{choice.symbol}</Text>
        </Choice>
      ))}</View>

      <SectionTitle title="Vehicle" detail="Shown to an accepted rider so they can recognize the correct car." />
      <Text style={styles.groupLabel}>COLOR</Text>
      <View style={styles.optionGrid}>{vehicleColorChoices.map((choice) => (
        <Choice key={choice.id} label={choice.label} selected={choice.id === vehicleColorId} onPress={() => setVehicleColorId(choice.id)}>
          <View style={[styles.swatch, { backgroundColor: choice.hex }]} />
        </Choice>
      ))}</View>
      <Text style={styles.groupLabel}>BODY STYLE</Text>
      <View style={styles.optionGrid}>{vehicleTypeChoices.map((choice) => (
        <Choice key={choice} label={choice} selected={choice === vehicleType} onPress={() => setVehicleType(choice)}>
          <Text style={styles.carChoiceIcon}>{vehicleIcon(choice)}</Text>
        </Choice>
      ))}</View>
      <Field label="Car nickname" value={vehicleNickname} onChangeText={(value) => setVehicleNickname(value.slice(0, 24))} placeholder="Example: Bluebird" hint="Optional, 24 characters maximum" />
      <Button label="Save pickup identity" onPress={() => dispatch({ type: "UPDATE_APPEARANCE", appearance: { avatarId, vehicleColorId, vehicleType, vehicleNickname } })} />
      <Text style={styles.disclaimer}>Custom styling helps recognition. It does not verify a person, license plate, insurance, ownership, or vehicle safety.</Text>
    </AppScreen>
  );
}

function Choice({ label, selected, onPress, children }: { label: string; selected: boolean; onPress: () => void; children: React.ReactNode }) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.choice, selected && styles.choiceSelected, pressed && styles.pressed]}>{children}<Text style={[styles.choiceLabel, selected && styles.choiceLabelSelected]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  preview: { flexDirection: "row", alignItems: "center", gap: 12 },
  previewText: { flex: 1 },
  avatar: { width: 54, height: 54, borderRadius: 18, backgroundColor: colors.cobalt, borderWidth: 2, borderColor: "#7898E8", alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.white, fontSize: 26, fontWeight: "900" },
  previewName: { color: colors.white, fontSize: 18, fontWeight: "900", marginTop: 8 },
  previewDetail: { color: "#B7C5DA", fontSize: 10, lineHeight: 15, marginTop: 3 },
  car: { width: 51, height: 35, borderRadius: 11, borderWidth: 2, borderColor: colors.white, alignItems: "center", justifyContent: "center" },
  carIcon: { color: colors.white, fontSize: 21, fontWeight: "900" },
  optionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  choice: { flexGrow: 1, flexBasis: 112, minHeight: 78, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 10, alignItems: "center", justifyContent: "center" },
  choiceSelected: { borderWidth: 2, borderColor: colors.cobalt, backgroundColor: colors.blueSoft },
  choiceSymbol: { color: colors.cobaltDark, fontSize: 25, fontWeight: "900" },
  choiceLabel: { color: colors.ink, fontSize: 11, fontWeight: "800", marginTop: 7, textAlign: "center" },
  choiceLabelSelected: { color: colors.cobaltDark },
  swatch: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: colors.white },
  carChoiceIcon: { color: colors.cobaltDark, fontSize: 25, fontWeight: "900" },
  groupLabel: { color: colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 0.7, marginBottom: 8 },
  pressed: { opacity: 0.74 },
  disclaimer: { color: colors.muted, fontSize: 10, lineHeight: 16, textAlign: "center", margin: 14 }
});
