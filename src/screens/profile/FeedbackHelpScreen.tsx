import React from "react";
import { Linking, StyleSheet, Text } from "react-native";

import { AppScreen, BackButton, Button, Card, PageHeader, Pill, SectionTitle } from "../../components/primitives";
import { useApp } from "../../state/AppContext";
import { colors } from "../../theme/tokens";

const ISSUE_URL = "https://github.com/Destr0yering/got2get2work/issues/new";
const SUPPORT_EMAIL = "support@got2get2work.com";
const SUPPORT_URL = `mailto:${SUPPORT_EMAIL}?subject=Got2Get2Work%20support`;

export function FeedbackHelpScreen() {
  const { dispatch } = useApp();

  async function openIssueForm() {
    try {
      await Linking.openURL(ISSUE_URL);
    } catch {
      dispatch({ type: "SET_NOTICE", notice: `Could not open the feedback form. Visit ${ISSUE_URL}` });
    }
  }

  async function emailSupport() {
    try {
      await Linking.openURL(SUPPORT_URL);
    } catch {
      dispatch({ type: "SET_NOTICE", notice: `Could not open email. Contact ${SUPPORT_EMAIL}` });
    }
  }

  return (
    <AppScreen>
      <BackButton label="Profile" onPress={() => dispatch({ type: "SET_TAB", tab: "profile" })} />
      <PageHeader
        eyebrow="Feedback & support"
        title="Tell us what worked—or what went wrong"
        subtitle="Contact Got2Get2Work for support, privacy requests, or feedback."
      />
      <Card tone="blue">
        <Pill label="Private support email" tone="blue" />
        <Text style={styles.title}>Get help or make a privacy request</Text>
        <Text style={styles.body}>Email the monitored support inbox. Include only the information needed to explain the issue; never send passwords, verification codes, or payment information.</Text>
        <Button label="Email Got2Get2Work Support" onPress={emailSupport} />
      </Card>
      <SectionTitle title="Public product feedback" />
      <Card>
        <Text style={styles.title}>Report a general bug or accessibility problem</Text>
        <Text style={styles.body}>The public GitHub form is appropriate only for non-personal product feedback. Do not include names, schedules, locations, contact details, or other personal information.</Text>
        <Button label="Open public feedback form" variant="secondary" onPress={openIssueForm} />
      </Card>
      <SectionTitle title="Safety reports" />
      <Card tone="amber">
        <Text style={styles.title}>This prototype is not an emergency service</Text>
        <Text style={styles.body}>For immediate danger, use local emergency services. The public feedback form is not monitored for urgent incidents, and this demo does not operate transportation or dispatch assistance.</Text>
      </Card>
      <Text style={styles.contact}>Support and privacy: {SUPPORT_EMAIL}</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.ink, fontSize: 17, fontWeight: "900", marginTop: 10 },
  body: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 6, marginBottom: 10 },
  contact: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "center", margin: 14 },
});
