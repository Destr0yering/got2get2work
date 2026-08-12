import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { useAuth } from "../../auth/AuthContext";
import { AppScreen, BackButton, Brand, Button, Card, Field, Notice, PageHeader, Pill } from "../../components/primitives";
import { productionApi } from "../../services/ProductionApi";
import { useApp } from "../../state/AppContext";
import { colors } from "../../theme/tokens";

export function SignUpScreen() {
  const { dispatch } = useApp();
  const { signUp, deleteNewAccount, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await signUp(email, password);
      await productionApi.enrollBeta(inviteCode);
      dispatch({ type: "NAVIGATE", route: "privacy" });
    } catch (reason) {
      await deleteNewAccount().catch(() => undefined);
      setError(reason instanceof Error ? reason.message : "Beta enrollment failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppScreen>
      <BackButton label="Welcome" onPress={() => dispatch({ type: "NAVIGATE", route: "welcome" })} />
      <Brand dark />
      <PageHeader eyebrow="Galaxy Store closed beta" title="Create your tester account" subtitle="Your invite code places you in the private beta community. Your commute details remain private until you approve a match." />
      {error ? <Notice message={error} tone="red" /> : null}
      {!configured ? <Notice message="The production account service is unavailable." tone="red" /> : null}
      <Card tone="green">
        <Pill label="Invite required" tone="green" />
        <Text style={styles.title}>Join the real multi-user beta</Text>
        <Text style={styles.body}>Use an email you control. You will verify policies, choose Driver or Passenger for each direction, and add your own schedule.</Text>
      </Card>
      <Card>
        <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
        <Field label="Create password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" hint="Use at least 8 characters." />
        <Field label="Beta invite code" value={inviteCode} onChangeText={setInviteCode} autoCapitalize="characters" autoCorrect={false} />
        <Button label="Create beta account" busy={busy} disabled={!configured || !email.trim() || password.length < 8 || !inviteCode.trim()} onPress={submit} />
      </Card>
      <Button label="I already have an account" variant="secondary" onPress={() => dispatch({ type: "NAVIGATE", route: "sign-in" })} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.ink, fontSize: 19, fontWeight: "900", marginTop: 12 },
  body: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
});
