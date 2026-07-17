import React from "react";
import { StatusBar } from "expo-status-bar";

import { AppNavigator } from "./navigation/AppNavigator";
import { AppProvider, useApp } from "./state/AppContext";

export default function CommuteKindApp() {
  return (
    <AppProvider>
      <AppChrome />
    </AppProvider>
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
