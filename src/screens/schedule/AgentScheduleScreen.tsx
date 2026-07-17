import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { AppScreen, BackButton, Button, Card, Field, Notice, PageHeader, Pill } from "../../components/primitives";
import { useApp } from "../../state/AppContext";
import { colors } from "../../theme/tokens";

export function AgentScheduleScreen() {
  const { state, dispatch, parseSchedule } = useApp();
  const [text, setText] = useState(state.scheduleText);
  const onboarding = state.trip.status === "needs_plan";
  return (
    <AppScreen>
      <BackButton label={onboarding ? "Commute profile" : "Schedule"} onPress={() => dispatch({ type: "NAVIGATE", route: onboarding ? "profile-setup" : "main" })} />
      <PageHeader eyebrow="Schedule agent" title="Tell the agent when you work" subtitle="Paste a message, describe a recurring pattern, or type one shift. You review the structured result before saving." />
      <Card tone="blue">
        <Pill label="Try this" tone="blue" />
        <Text style={styles.example}>“Warehouse A, Mon–Thu, 7–3:30”</Text>
      </Card>
      <Field
        label="Schedule text"
        value={text}
        onChangeText={setText}
        multiline
        placeholder="Example: North Campus, Tuesday 7 AM to 3:30 PM"
        hint="Offline demo: this text stays in the app and is structured locally. If the optional live service is enabled later, its server sends GPT only extracted weekdays/times and an opaque workplace reference."
      />
      {state.agentError ? <Notice tone="red" message={state.agentError} /> : null}
      <Button label="Structure my schedule" busy={state.agentBusy} disabled={!text.trim()} onPress={() => void parseSchedule(text)} />
      <Text style={styles.disclaimer}>The agent does not save or sync anything until you approve the next screen.</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  example: { color: colors.ink, fontSize: 15, lineHeight: 22, fontWeight: "700", marginTop: 10 },
  disclaimer: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "center", marginTop: 12 }
});
