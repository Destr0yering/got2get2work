import React, { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { AppScreen, BackButton, Brand, Button, Card, Field, Notice, PageHeader } from "../../components/primitives";
import { useAuth } from "../../auth/AuthContext";
import { PASSWORD_RESET_CONFIRMATION } from "../../auth/passwordReset";
import { useApp } from "../../state/AppContext";
import { colors } from "../../theme/tokens";

export function SignInScreen() {
  const { dispatch } = useApp();
  const { signIn, requestPasswordReset, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetConfirmation, setResetConfirmation] = useState<string | null>(null);

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

  async function resetPassword() {
    setResetBusy(true);
    setError(null);
    setResetConfirmation(null);
    try {
      await requestPasswordReset(email);
      setResetConfirmation(PASSWORD_RESET_CONFIRMATION);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to send the reset email. Try again shortly.");
    } finally {
      setResetBusy(false);
    }
  }

  return (
    <AppScreen>
      <BackButton label="Welcome" onPress={() => dispatch({ type: "NAVIGATE", route: "welcome" })} />
      <Brand dark />
      <PageHeader eyebrow="Employer benefit" title="Sign in securely" subtitle="Use the email address enrolled by your employer. Your organization and role are verified on the server." />
      {error ? <Notice message={error} tone="red" /> : null}
      {resetConfirmation ? <Notice message={resetConfirmation} /> : null}
      {!configured ? <Notice message="Sign-in is not configured in this preview release. The seeded demo remains available." tone="amber" /> : null}
      <Card>
        <Field label="Work email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" />
        <Button label="Sign in" busy={busy} disabled={!configured || !email.trim() || !password} onPress={submit} />
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Forgot password?"
          accessibilityHint="Sends a password reset link to the work email entered above"
          disabled={!configured || resetBusy}
          onPress={() => void resetPassword()}
          style={({ pressed }) => [styles.resetLink, (!configured || resetBusy) && styles.disabled, pressed && styles.pressed]}
        >
          <Text style={styles.resetLinkText}>{resetBusy ? "Sending reset email…" : "Forgot password?"}</Text>
        </Pressable>
        <Text style={styles.help}>Need account access? Contact support@got2get2work.com.</Text>
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  resetLink: { minHeight: 44, alignItems: "center", justifyContent: "center", marginTop: 6 },
  resetLinkText: { color: colors.cobaltDark, fontSize: 14, fontWeight: "800", textDecorationLine: "underline" },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.7 },
  help: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 4 }
});
