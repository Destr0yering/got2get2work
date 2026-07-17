import React from "react";
import { StyleSheet, Text } from "react-native";

import { AppScreen, BackButton, Card, PageHeader, SectionTitle } from "../../components/primitives";
import { useApp } from "../../state/AppContext";
import { colors } from "../../theme/tokens";

const termsSections = [
  ["Coordination service", "CommuteKind coordinates possible coworker carpools. It is not a carrier, employer, emergency service, ride guarantee, or driver-safety verification service."],
  ["Eligibility and workplace badge", "The MVP is for adults in a participating workplace group. A work-email badge represents fictional demo affiliation only; it is not an identity, background, license, insurance, driving-record, or vehicle-safety check."],
  ["Driving responsibilities", "Drivers remain responsible for licenses, registration, insurance, vehicle condition, seat belts, and local law. Each person independently decides whether to participate."],
  ["Expense sharing", "Amounts are suggested expense shares—not fares—and this prototype processes no payment."],
  ["User control", "The local demo may structure schedules and explain computed options. A deferred GPT adapter is optional. Neither path accepts, cancels, contacts, pays, or reveals meeting details. Each coworker must consent."],
  ["Optional permissions", "Schedule and notification choices are separate from accepting these Terms. Pickup proximity is also optional, appears only after confirmation, and requires a separate choice from each coworker."],
  ["Prototype limitation", "Demo schedules, detours, savings, availability, and match options may be incomplete or wrong. Production use requires legal and operational review."]
] as const;

const privacySections = [
  ["Data used", "The prototype uses fictional work-email affiliation, commute role, schedule, a cross-street or general-area label entered by the user, ride state, and non-identifying match facts."],
  ["Location handling", "The MVP does not request an exact home address, but a cross-street or area label is still location information. It remains in local in-memory demo state and can appear in Profile. Seeded match cards use broader demo area labels rather than deriving a real route from that entry."],
  ["Data not required", "An exact home address, continuous background location, payment card, government ID, driver record, insurance record, payroll, and attendance history are not required."],
  ["AI boundary", "In the offline demo, schedule prose stays in the app and is structured locally. If the optional live service is enabled later, its server constructs a new OpenAI request from allowlisted shift fields; raw prose and profile-area values are not forwarded. Common personal and location patterns are also rejected early. Match explanations receive allowlisted numeric and boolean facts."],
  ["Progressive demo sharing", "Seeded recommendations show broader pickup-area and compatibility labels. After both demo coworkers agree, the prototype reveals the selected public meeting point, vehicle description, and ride thread."],
  ["Pickup proximity", "The confirmed-ride demo can simulate foreground Bluetooth proximity using a fictional rotating ride token and broad approach states. It does not scan for strangers, request exact coordinates, run in the background, or connect to device Bluetooth hardware. Either coworker can stop sharing."],
  ["Optional preferences", "The schedule and notification switches are prototype preference flags. No external scheduling account is connected and no operating-system push notification is sent."],
  ["Prototype storage", "Demo state stays in memory. Production must add documented deletion, retention, encryption, access, block, report, and incident-response controls."]
] as const;

export function LegalScreen({ kind }: { kind: "terms" | "privacy" }) {
  const { dispatch } = useApp();
  const sections = kind === "terms" ? termsSections : privacySections;
  return (
    <AppScreen wide>
      <BackButton label="Privacy choices" onPress={() => dispatch({ type: "NAVIGATE", route: "privacy" })} />
      <PageHeader
        eyebrow="Hackathon prototype · July 17, 2026"
        title={kind === "terms" ? "CommuteKind MVP Terms" : "CommuteKind MVP Privacy Notice"}
        subtitle="Plain-language demo copy. A real pilot requires counsel-reviewed policies and production controls."
      />
      {sections.map(([title, body]) => (
        <React.Fragment key={title}>
          <SectionTitle title={title} />
          <Card><Text style={styles.body}>{body}</Text></Card>
        </React.Fragment>
      ))}
      <Text style={styles.contact}>Questions about this hackathon prototype can be sent to the project submitter through the Devpost submission profile.</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  body: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  contact: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "center", margin: 14 }
});
