import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { AppScreen, BackButton, Brand, Button, Card, Field, Notice, PageHeader } from "../../components/primitives";
import { useAuth } from "../../auth/AuthContext";
import { useApp } from "../../state/AppContext";
import { colors } from "../../theme/tokens";

export function SignInScreen() {
  const { dispatch } = useApp();
  const { signIn, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      dispatch({ type: "NAVIGATE", route: "privacy" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppScreen>
      <BackButton label="Welcome" onPress={() => dispatch({ type: "NAVIGATE", route: "welcome" })} />
      <Brand dark />
      <PageHeader eyebrow="Employer benefit" title="Sign in securely" subtitle="Use the email address enrolled by your employer. Your organization and role are verified on the server." />
      {error ? <Notice message={error} tone="red" /> : null}
      {!configured ? <Notice message="Sign-in is not configured in this preview release. The seeded demo remains available." tone="amber" /> : null}
      <Card>
        <Field label="Work email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" />
        <Button label="Sign in" busy={busy} disabled={!configured || !email.trim() || !password} onPress={submit} />
        <Text style={styles.help}>Need access or a password reset? Contact support@got2get2work.com.</Text>
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({ help: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 12 } });
