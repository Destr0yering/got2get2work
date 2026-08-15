import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
import { User, createUserWithEmailAndPassword, onAuthStateChanged, reload, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";

import { firebaseAuth, isFirebaseConfigured, loadFirebaseConfig } from "../services/firebase";
import { isPrivatePasswordResetError, normalizePasswordResetEmail } from "./passwordReset";

interface AuthValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<boolean>;
  resendEmailVerification(): Promise<void>;
  refreshEmailVerification(): Promise<boolean>;
  requestPasswordReset(email: string): Promise<void>;
  signOutUser(): Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [configured, setConfigured] = useState(isFirebaseConfigured());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    void loadFirebaseConfig().then((ready) => {
      if (cancelled) return;
      setConfigured(ready);
      if (!ready) {
        setLoading(false);
        return;
      }
      unsubscribe = onAuthStateChanged(firebaseAuth(), (next) => {
        setUser(next);
        setLoading(false);
      });
    }).catch(() => setLoading(false));
    return () => { cancelled = true; unsubscribe?.(); };
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      configured,
      signIn: async (email, password) => { await signInWithEmailAndPassword(firebaseAuth(), email.trim(), password); },
      signUp: async (email, password) => {
        const auth = firebaseAuth();
        const normalizedEmail = email.trim().toLowerCase();
        let account = auth.currentUser;

        if (account?.email?.toLowerCase() !== normalizedEmail || account.emailVerified) {
          try {
            account = (await createUserWithEmailAndPassword(auth, normalizedEmail, password)).user;
          } catch (reason) {
            if (!(reason instanceof FirebaseError) || reason.code !== "auth/email-already-in-use") throw reason;
            account = (await signInWithEmailAndPassword(auth, normalizedEmail, password)).user;
            if (account.emailVerified) throw new Error("This account is already verified. Sign in instead.");
          }
        }

        try {
          await sendEmailVerification(account);
          return true;
        } catch {
          // Account creation succeeded. Keep the signed-in, unverified account so
          // the verification screen can offer a retry without orphaning the user.
          return false;
        }
      },
      resendEmailVerification: async () => {
        const current = firebaseAuth().currentUser;
        if (!current) throw new Error("Create or sign in to your account before requesting verification.");
        await sendEmailVerification(current);
      },
      refreshEmailVerification: async () => {
        const current = firebaseAuth().currentUser;
        if (!current) return false;
        await reload(current);
        if (current.emailVerified) await current.getIdToken(true);
        return current.emailVerified;
      },
      requestPasswordReset: async (email) => {
        try {
          await sendPasswordResetEmail(firebaseAuth(), normalizePasswordResetEmail(email));
        } catch (reason) {
          if (!isPrivatePasswordResetError(reason)) throw reason;
        }
      },
      signOutUser: async () => { await signOut(firebaseAuth()); },
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
