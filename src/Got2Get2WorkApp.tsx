import React from "react";
import { StatusBar } from "expo-status-bar";

import { AppNavigator } from "./navigation/AppNavigator";
import { AppProvider, useApp } from "./state/AppContext";
import { AuthProvider } from "./auth/AuthContext";

export default function Got2Get2WorkApp() {
  return (
    <AuthProvider><AppProvider><AppChrome /></AppProvider></AuthProvider>
  );
}

function AppChrome() {
  const { state } = useApp();
  return (
    <>
      <StatusBar style={state.route === "welcome" || state.route === "main" ? "light" : "dark"} />
      <AppNavigator />
    </>
  );
}
