import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle
} from "react-native";

import { AgentMeta } from "../domain/models";
import { colors, contentWidth, radius, spacing } from "../theme/tokens";

export function AppScreen({ children, wide = false, testID, backgroundColor = colors.canvas }: { children: ReactNode; wide?: boolean; testID?: string; backgroundColor?: string }) {
  return (
    <ScrollView
      testID={testID}
      style={[styles.screen, { backgroundColor }]}
      contentContainerStyle={styles.screenContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.screenInner, { maxWidth: wide ? contentWidth.detail : contentWidth.phone }]}>{children}</View>
    </ScrollView>
  );
}

export function Brand({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  return (
    <View accessible accessibilityRole="image" style={styles.brandRow} accessibilityLabel="CommuteKind logo">
      <View style={[styles.brandMark, compact && styles.brandMarkCompact]}>
        <View style={[styles.routeStem, styles.routeStemLeft]} />
        <View style={[styles.routeStem, styles.routeStemRight]} />
        <View style={styles.routeDot} />
      </View>
      <View>
        <Text style={[styles.brandName, compact && styles.brandNameCompact, dark && styles.brandNameDark]}>CommuteKind</Text>
        {!compact ? <Text style={[styles.brandTagline, dark && styles.brandTaglineDark]}>Your shift has a way there.</Text> : null}
      </View>
    </View>
  );
}

type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  busy = false,
  accessibilityHint
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  busy?: boolean;
  accessibilityHint?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[`${variant}Button`],
        (disabled || busy) && styles.buttonDisabled,
        pressed && styles.buttonPressed
      ]}
    >
      {busy ? <ActivityIndicator color={variant === "secondary" || variant === "quiet" ? colors.cobalt : colors.white} /> : null}
      <Text style={[styles.buttonLabel, styles[`${variant}ButtonLabel`]]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, tone = "plain", style }: { children: ReactNode; tone?: "plain" | "blue" | "green" | "amber" | "dark" | "red"; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, styles[`${tone}Card`], style]}>{children}</View>;
}

export function PageHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <View style={styles.pageHeader}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text accessibilityRole="header" style={styles.pageTitle}>{title}</Text>
      {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionTitle({ title, detail }: { title: string; detail?: string }) {
  return (
    <View style={styles.sectionTitleWrap}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
      {detail ? <Text style={styles.sectionDetail}>{detail}</Text> : null}
    </View>
  );
}

export function Field({ label, hint, ...props }: TextInputProps & { label: string; hint?: string }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...props}
        accessibilityLabel={label}
        placeholderTextColor="#8A94A4"
        style={[styles.field, props.multiline && styles.fieldMultiline, props.style]}
      />
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

export function Pill({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "blue" | "green" | "amber" | "red" }) {
  return (
    <View style={[styles.pill, styles[`${tone}Pill`]]}>
      <Text style={[styles.pillLabel, styles[`${tone}PillLabel`]]}>{label}</Text>
    </View>
  );
}

export function AgentSourceBadge({ meta }: { meta: AgentMeta }) {
  const live = meta.source === "live_gpt";
  return (
    <View>
      <Pill label={live ? `LIVE GPT · ${meta.model ?? "MODEL"}` : "OFFLINE DEMO · LOCAL"} tone={live ? "green" : "blue"} />
      {meta.fallbackReason ? (
        <View style={styles.fallbackNote} accessibilityLiveRegion="polite">
          <Text style={styles.fallbackTitle}>Demo fallback active</Text>
          <Text style={styles.fallbackText}>The live agent was unavailable ({meta.fallbackReason}). Verified local demo data is being shown.</Text>
        </View>
      ) : null}
    </View>
  );
}

export function Notice({ message, tone = "green" }: { message: string; tone?: "green" | "amber" | "red" }) {
  return (
    <View accessibilityLiveRegion="polite" style={[styles.notice, styles[`${tone}Notice`]]}>
      <Text style={[styles.noticeText, styles[`${tone}NoticeText`]]}>{message}</Text>
    </View>
  );
}

export function Choice({ label, detail, selected, onPress }: { label: string; detail?: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.choice, selected && styles.choiceSelected, pressed && styles.buttonPressed]}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
      <View style={styles.flex}>
        <Text style={styles.choiceLabel}>{label}</Text>
        {detail ? <Text style={styles.choiceDetail}>{detail}</Text> : null}
      </View>
    </Pressable>
  );
}

export function BackButton({ label = "Back", onPress }: { label?: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.backButton}>
      <Text style={styles.backButtonText}>‹ {label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  screenContent: { flexGrow: 1, alignItems: "center", paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: 112 },
  screenInner: { width: "100%" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  brandMark: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.cobalt, overflow: "hidden", position: "relative" },
  brandMarkCompact: { width: 38, height: 38, borderRadius: 13 },
  routeStem: { position: "absolute", width: 5, height: 34, backgroundColor: colors.white, borderRadius: 4, top: 8 },
  routeStemLeft: { left: 15, transform: [{ rotate: "-25deg" }] },
  routeStemRight: { right: 14, transform: [{ rotate: "25deg" }] },
  routeDot: { position: "absolute", width: 8, height: 8, borderRadius: 4, backgroundColor: "#A9C4FF", bottom: 7, left: 20 },
  brandName: { color: colors.white, fontSize: 24, fontWeight: "900", letterSpacing: -0.6 },
  brandNameCompact: { fontSize: 18 },
  brandNameDark: { color: colors.ink },
  brandTagline: { color: "#AFC0DA", fontSize: 12, marginTop: 2 },
  brandTaglineDark: { color: colors.muted },
  button: { minHeight: 52, borderRadius: radius.md, paddingHorizontal: 18, marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, borderWidth: 1 },
  primaryButton: { backgroundColor: colors.cobalt, borderColor: colors.cobalt },
  secondaryButton: { backgroundColor: colors.surface, borderColor: colors.borderStrong },
  quietButton: { backgroundColor: colors.blueSoft, borderColor: colors.blueSoft },
  dangerButton: { backgroundColor: colors.red, borderColor: colors.red },
  buttonDisabled: { opacity: 0.45 },
  buttonPressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
  buttonLabel: { fontSize: 16, fontWeight: "800", textAlign: "center" },
  primaryButtonLabel: { color: colors.white },
  secondaryButtonLabel: { color: colors.ink },
  quietButtonLabel: { color: colors.cobaltDark },
  dangerButtonLabel: { color: colors.white },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, shadowColor: colors.midnight, shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  plainCard: {},
  blueCard: { backgroundColor: colors.blueSoft, borderColor: "#C9D7FB" },
  greenCard: { backgroundColor: colors.kindSoft, borderColor: "#B8E3D5" },
  amberCard: { backgroundColor: colors.amberSoft, borderColor: "#F0CEA2" },
  redCard: { backgroundColor: colors.redSoft, borderColor: "#F0BFC3" },
  darkCard: { backgroundColor: colors.midnight, borderColor: colors.midnightSoft },
  pageHeader: { marginBottom: spacing.lg },
  eyebrow: { color: colors.cobaltDark, fontWeight: "900", fontSize: 11, letterSpacing: 1.1, textTransform: "uppercase", marginBottom: 8 },
  pageTitle: { color: colors.ink, fontSize: 32, lineHeight: 38, fontWeight: "900", letterSpacing: -0.8 },
  pageSubtitle: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 9 },
  sectionTitleWrap: { marginTop: spacing.sm, marginBottom: spacing.sm },
  sectionTitle: { color: colors.ink, fontSize: 21, lineHeight: 27, fontWeight: "900", letterSpacing: -0.3 },
  sectionDetail: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 3 },
  fieldWrap: { marginBottom: spacing.md },
  fieldLabel: { color: colors.ink, fontSize: 13, fontWeight: "800", marginBottom: 7 },
  field: { minHeight: 52, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: 14, color: colors.ink, fontSize: 16 },
  fieldMultiline: { minHeight: 120, paddingTop: 13, textAlignVertical: "top" },
  fieldHint: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 6 },
  pill: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: "#EEF1F4" },
  pillLabel: { color: colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 0.4, textTransform: "uppercase" },
  neutralPill: {}, neutralPillLabel: {},
  bluePill: { backgroundColor: colors.blueSoft }, bluePillLabel: { color: colors.cobaltDark },
  greenPill: { backgroundColor: colors.kindSoft }, greenPillLabel: { color: "#0E7154" },
  amberPill: { backgroundColor: colors.amberSoft }, amberPillLabel: { color: colors.amber },
  redPill: { backgroundColor: colors.redSoft }, redPillLabel: { color: colors.red },
  fallbackNote: { marginTop: 10, borderRadius: radius.sm, backgroundColor: colors.amberSoft, padding: 11, borderWidth: 1, borderColor: "#E9C18B" },
  fallbackTitle: { color: colors.amber, fontSize: 12, fontWeight: "900" },
  fallbackText: { color: "#80521C", fontSize: 11, lineHeight: 16, marginTop: 3 },
  notice: { minHeight: 44, borderRadius: radius.sm, paddingHorizontal: 13, paddingVertical: 11, borderWidth: 1, marginHorizontal: spacing.md, marginTop: spacing.sm },
  greenNotice: { backgroundColor: colors.kindSoft, borderColor: "#B8E3D5" }, greenNoticeText: { color: "#0D6A50" },
  amberNotice: { backgroundColor: colors.amberSoft, borderColor: "#F0CEA2" }, amberNoticeText: { color: "#80521C" },
  redNotice: { backgroundColor: colors.redSoft, borderColor: "#F0BFC3" }, redNoticeText: { color: colors.red },
  noticeText: { fontSize: 13, lineHeight: 19, fontWeight: "700" },
  choice: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, padding: 13, marginBottom: 10, backgroundColor: colors.surface },
  choiceSelected: { borderColor: colors.cobalt, backgroundColor: colors.blueSoft },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.borderStrong, alignItems: "center", justifyContent: "center" },
  radioSelected: { borderColor: colors.cobalt },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.cobalt },
  choiceLabel: { color: colors.ink, fontWeight: "800", fontSize: 15 },
  choiceDetail: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  flex: { flex: 1 },
  backButton: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center", marginBottom: 8, paddingRight: 14 },
  backButtonText: { color: colors.cobaltDark, fontWeight: "800", fontSize: 14 }
});
