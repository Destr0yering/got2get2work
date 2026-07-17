import { AvatarId, IdentityAppearance, VehicleColorId, VehicleType } from "./models";

export const avatarChoices: Array<{ id: AvatarId; label: string; symbol: string }> = [
  { id: "sun", label: "Sun", symbol: "☀" },
  { id: "leaf", label: "Leaf", symbol: "♧" },
  { id: "bolt", label: "Bolt", symbol: "ϟ" },
  { id: "star", label: "Star", symbol: "★" }
];

export const vehicleColorChoices: Array<{ id: VehicleColorId; label: string; hex: string }> = [
  { id: "blue", label: "Ocean blue", hex: "#356AE6" },
  { id: "green", label: "Forest green", hex: "#168A68" },
  { id: "red", label: "Brick red", hex: "#B93C45" },
  { id: "silver", label: "Silver", hex: "#7B8798" }
];

export const vehicleTypeChoices: VehicleType[] = ["Compact SUV", "Sedan", "Hatchback", "Pickup"];

export function avatarChoice(id: AvatarId) {
  return avatarChoices.find((choice) => choice.id === id) ?? avatarChoices[0];
}

export function vehicleColorChoice(id: VehicleColorId) {
  return vehicleColorChoices.find((choice) => choice.id === id) ?? vehicleColorChoices[0];
}

export function vehicleIcon(type: VehicleType) {
  return type === "Pickup" ? "▰" : type === "Compact SUV" ? "▣" : "▱";
}

export function vehicleDescription(appearance: IdentityAppearance, plateEnding?: string) {
  const base = `${vehicleColorChoice(appearance.vehicleColorId).label} ${appearance.vehicleType.toLowerCase()}`;
  return plateEnding ? `${base} · plate ending ${plateEnding}` : `${appearance.vehicleNickname} · ${base}`;
}
