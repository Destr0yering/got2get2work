import React from "react";
import { Linking, StyleSheet, Text } from "react-native";

import { AppScreen, BackButton, Button, Card, PageHeader, SectionTitle } from "../../components/primitives";
import { useApp } from "../../state/AppContext";
import { colors } from "../../theme/tokens";

const termsSections = [
  ["Coordination service", "Got2Get2Work coordinates possible coworker carpools. It is not a carrier, employer, emergency service, ride guarantee, or driver-safety verification service."],
  ["Eligibility and workplace badge", "The pilot is for adults in a participating workplace group. Authenticated membership and role are verified on the server. A workplace badge is not a background, license, insurance, driving-record, or vehicle-safety check."],
  ["Driving responsibilities", "Drivers remain responsible for licenses, registration, insurance, vehicle condition, seat belts, and local law. Each person independently decides whether to participate."],
  ["Suggested trip value", "Amounts are optional suggested trip values shown before agreement. Got2Get2Work processes no payment."],
  ["User control", "The local demo may structure schedules and explain computed options. A deferred GPT adapter is optional. Neither path accepts, cancels, contacts, pays, or reveals meeting details. Each coworker must consent."],
  ["Optional permissions", "Schedule and notification choices are separate from accepting these Terms. Pickup proximity is also optional, appears only after confirmation, and requires a separate choice from each coworker."],
  ["Safety and account controls", "Authenticated reports, consent records, account export, deletion, and coworker blocks use server-side records. Blocking requires a real selected coworker; trusted-contact sharing remains a preview."],
  ["Pilot limitation", "Schedules, detours, savings, availability, and match options may be incomplete or wrong. Enrollment of a real workforce requires legal and operational review."]
] as const;

const privacySections = [
  ["Data used", "The authenticated pilot uses Firebase identity, work email, server-assigned employer membership and role, commute preferences, schedule, a cross-street or general-area label, ride state, consent records, blocks, reports, and non-identifying match facts. The open demo uses fictional identities."],
  ["Location handling", "The MVP does not request an exact home address, but a cross-street or area label is still location information. It remains in local in-memory demo state and can appear in Profile. Seeded match cards use broader demo area labels rather than deriving a real route from that entry."],
  ["Data not required", "An exact home address, continuous background location, payment card, government ID, driver record, insurance record, payroll, and attendance history are not required."],
  ["AI boundary", "In the offline demo, schedule prose stays in the app and is structured locally. If the optional live service is enabled later, its server constructs a new OpenAI request from allowlisted shift fields; raw prose and profile-area values are not forwarded. Common personal and location patterns are also rejected early. Match explanations receive allowlisted numeric and boolean facts."],
  ["Progressive demo sharing", "Seeded recommendations show broader pickup-area and compatibility labels. After both demo coworkers agree, the prototype reveals the selected public meeting point, vehicle description, and ride thread."],
  ["Pickup proximity", "The confirmed-ride demo can simulate foreground Bluetooth proximity using a fictional rotating ride token and broad approach states. It does not scan for strangers, request exact coordinates, run in the background, or connect to device Bluetooth hardware. Either coworker can stop sharing."],
  ["Optional preferences", "Schedule and notification choices are recorded separately from policy acceptance. No external scheduling account is connected and no operating-system push notification is currently sent."],
  ["Storage and deletion", "The fictional demo stays local. Authenticated pilot records use tenant-isolated Firestore storage. Export and deletion are available in Privacy controls. Deletion removes the account, profile, membership, consents, and blocks; retained incident reports are disconnected from the deleted reporter account. Database deletion protection is enabled; paid point-in-time recovery is not enabled."]
] as const;

export function LegalScreen({ kind }: { kind: "terms" | "privacy" }) {
  const { state, dispatch } = useApp();
  const sections = kind === "terms" ? termsSections : privacySections;
  const supportEmail = "support@got2get2work.com";
  const supportUrl = `mailto:${supportEmail}?subject=Got2Get2Work%20support`;
  return (
    <AppScreen wide>
      <BackButton
        label={state.acceptedTerms ? "Privacy controls" : "Privacy choices"}
        onPress={() => dispatch({ type: "NAVIGATE", route: state.acceptedTerms ? "privacy-controls" : "privacy" })}
      />
      <PageHeader
        eyebrow="Pilot release · July 23, 2026"
        title={kind === "terms" ? "Got2Get2Work Pilot Terms" : "Got2Get2Work Pilot Privacy Notice"}
        subtitle="Plain-language pilot copy. Enrolling a real workforce still requires jurisdiction-specific counsel review."
      />
      {sections.map(([title, body]) => (
        <React.Fragment key={title}>
          <SectionTitle title={title} />
          <Card><Text style={styles.body}>{body}</Text></Card>
        </React.Fragment>
      ))}
      <Button label="Email Got2Get2Work Support" variant="secondary" onPress={() => Linking.openURL(supportUrl)} />
      <Text style={styles.contact}>Support and privacy contact: {supportEmail}. This inbox is not an emergency service.</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  body: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  contact: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "center", margin: 14 }
});
