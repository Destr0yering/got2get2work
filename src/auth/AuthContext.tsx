import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { User, createUserWithEmailAndPassword, deleteUser, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";

import { firebaseAuth, isFirebaseConfigured, loadFirebaseConfig } from "../services/firebase";
import { isPrivatePasswordResetError, normalizePasswordResetEmail } from "./passwordReset";

interface AuthValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  deleteNewAccount(): Promise<void>;
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
      signUp: async (email, password) => { await createUserWithEmailAndPassword(firebaseAuth(), email.trim(), password); },
      requestPasswordReset: async (email) => {
        try {
          await sendPasswordResetEmail(firebaseAuth(), normalizePasswordResetEmail(email));
        } catch (reason) {
          if (!isPrivatePasswordResetError(reason)) throw reason;
        }
      },
      deleteNewAccount: async () => { const current = firebaseAuth().currentUser; if (current) await deleteUser(current); },
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
