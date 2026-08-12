import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen, Card, PageHeader, Pill, SectionTitle } from "../../components/primitives";
import { useApp } from "../../state/AppContext";
import { colors } from "../../theme/tokens";

export function BenefitScreen() {
  const { state } = useApp();
  const benefit = state.benefit;
  const demoEnabled = process.env.EXPO_PUBLIC_DEMO_MODE === "true";
  const passengerActive = state.profile.toWorkRole === "passenger" || state.profile.homeRole === "passenger";
  const driverActive = state.profile.toWorkRole === "driver" || state.profile.homeRole === "driver";
  return (
    <AppScreen testID="benefit-screen">
      <PageHeader
        eyebrow="Your commute plan"
        title="Ride or drive. Your benefit follows you."
        subtitle="Passenger support and driver fuel perks stay separate, so you always know what applies to each trip."
      />
      <View style={styles.roleGrid}>
        <RoleCard
          active={passengerActive}
          accent="blue"
          icon="↓"
          title="I need a ride"
          label="PASSENGER"
          summary={`Use up to $${benefit.monthlyRideCredit} in ride support when a carpool is not available.`}
          bullets={["Matched coworker rides", `${benefit.guaranteedRideHomeRemaining} rescue rides remaining`, "Pickup details stay private until accepted"]}
        />
        <RoleCard
          active={driverActive}
          accent="green"
          icon="↑"
          title="Share your route. Save on fuel."
          label="DRIVER"
          summary="Offer an empty seat on the commute you already make. See the suggested trip value before you agree, every time."
          highlight={`Unlock up to ${benefit.driverFuelDiscountCents ?? 10}¢/gal in fuel discounts after ${benefit.fuelPerkTripThreshold ?? 4} verified shared trips`}
          bullets={["Fuel or EV-charging discounts from participating partners", "Suggested trip value shown before either coworker agrees", "Preferred carpool parking where the site offers it", "You control every day, seat, and detour"]}
        />
      </View>
      <Card tone="dark">
        <View style={styles.planHeader}>
          <View style={styles.flex}><Text style={styles.planKicker}>{demoEnabled ? "CURRENT PLAN" : "BETA PERK STATUS"}</Text><Text style={styles.darkTitle}>{demoEnabled ? benefit.planName : "Fuel partner pilot"}</Text></View>
          <Pill label={demoEnabled ? "Active" : "Partner pending"} tone={demoEnabled ? "green" : "amber"} />
        </View>
        <Text style={styles.darkBody}>{demoEnabled ? `${benefit.sponsorName} · ${benefit.siteName}` : "Fuel discounts activate only after a participating partner is confirmed. No discount is currently promised."}</Text>
        <View style={styles.legRow}>
          <Leg label="To work" role={state.profile.toWorkRole} />
          <Leg label="Home" role={state.profile.homeRole} />
        </View>
      </Card>
      <SectionTitle title="One benefit, two clear paths" detail="Your role can change by direction without changing your eligibility." />
      <Card tone="blue">
        <Pill label="Privacy boundary" tone="blue" />
        <Text style={styles.cardTitle}>Your employer sees outcomes, not your movements</Text>
        <Text style={styles.cardBody}>The pilot dashboard receives aggregate enrollment, protected-shift, recovery, and cost totals. It does not expose home addresses, routes, messages, or individual attendance.</Text>
      </Card>
      <Text style={styles.disclaimer}>Demo credits and rescue rides are illustrative. A real pilot requires employer policy, funding, eligibility, and local legal review.</Text>
    </AppScreen>
  );
}

function RoleCard({ active, accent, icon, title, label, summary, highlight, bullets }: { active: boolean; accent: "blue" | "green"; icon: string; title: string; label: string; summary: string; highlight?: string; bullets: string[] }) {
  return (
    <View accessibilityLabel={`${label}: ${title}${active ? ", active for this commute" : ""}`} style={[styles.roleCard, accent === "green" ? styles.driverCard : styles.passengerCard, active && styles.roleCardActive]}>
      <View style={styles.roleTop}><View style={[styles.roleIcon, accent === "green" ? styles.driverIcon : styles.passengerIcon]}><Text style={styles.roleIconText}>{icon}</Text></View>{active ? <Pill label="Your role" tone={accent} /> : null}</View>
      <Text style={styles.roleLabel}>{label}</Text>
      <Text style={styles.roleTitle}>{title}</Text>
      <Text style={styles.roleSummary}>{summary}</Text>
      {highlight ? <View style={styles.perkBanner}><Text style={styles.perkValue}>{highlight}</Text><Text style={styles.perkNote}>Pilot example · final fuel perks depend on participating partners</Text></View> : null}
      <View style={styles.bulletList}>{bullets.map((bullet) => <Text key={bullet} style={styles.bullet}>✓  {bullet}</Text>)}</View>
    </View>
  );
}

function Leg({ label, role }: { label: string; role: "passenger" | "driver" }) {
  return <View style={styles.leg}><Text style={styles.legLabel}>{label}</Text><Text style={styles.legValue}>{role === "passenger" ? "Passenger · need a ride" : "Driver · can drive"}</Text></View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  roleGrid: { gap: 12, marginBottom: 4 },
  roleCard: { borderWidth: 2, borderRadius: 22, padding: 18, marginBottom: 4 },
  passengerCard: { backgroundColor: "#F4F7FF", borderColor: "#B9CBF8" },
  driverCard: { backgroundColor: "#EFFAF6", borderColor: "#A9DDCC" },
  roleCardActive: { borderWidth: 3, shadowColor: colors.midnight, shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  roleTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  roleIcon: { width: 46, height: 46, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  passengerIcon: { backgroundColor: colors.cobalt },
  driverIcon: { backgroundColor: colors.kind },
  roleIconText: { color: colors.white, fontSize: 24, fontWeight: "900" },
  roleLabel: { color: colors.muted, fontSize: 11, fontWeight: "900", letterSpacing: 1.2, marginTop: 18 },
  roleTitle: { color: colors.ink, fontSize: 25, fontWeight: "900", letterSpacing: -0.4, marginTop: 3 },
  roleSummary: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  perkBanner: { backgroundColor: colors.kind, borderRadius: 14, padding: 13, marginTop: 14 },
  perkValue: { color: colors.white, fontSize: 16, lineHeight: 21, fontWeight: "900" },
  perkNote: { color: "#C9F2E5", fontSize: 10, lineHeight: 14, marginTop: 4 },
  bulletList: { borderTopWidth: 1, borderTopColor: "rgba(23,33,58,0.10)", marginTop: 15, paddingTop: 11, gap: 7 },
  bullet: { color: colors.ink, fontSize: 12, lineHeight: 18, fontWeight: "700" },
  planHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  planKicker: { color: "#8FA6C7", fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  darkTitle: { color: colors.white, fontSize: 22, fontWeight: "900", marginTop: 5 },
  darkBody: { color: "#B8C7DB", fontSize: 13, marginTop: 6 },
  legRow: { flexDirection: "row", gap: 8, marginTop: 16 },
  leg: { flex: 1, backgroundColor: colors.midnightSoft, borderRadius: 12, padding: 11 },
  legLabel: { color: "#8FA6C7", fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  legValue: { color: colors.white, fontSize: 12, lineHeight: 17, fontWeight: "800", marginTop: 4 },
  cardTitle: { color: colors.ink, fontSize: 16, fontWeight: "900" },
  cardBody: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 5 },
  disclaimer: { color: colors.muted, fontSize: 10, lineHeight: 16, textAlign: "center", margin: 12 }
});
