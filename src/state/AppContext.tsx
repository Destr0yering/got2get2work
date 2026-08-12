import React, { createContext, ReactNode, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";

import { applyPickupOption, matches } from "../data/demoSeed";
import { AppState } from "../domain/models";
import { CommuteGateway } from "../services/CommuteGateway";
import { createCommuteGateway } from "../services/HttpCommuteGateway";
import { AppAction } from "./actions";
import { appReducer, initialState } from "./reducer";
import { useAuth } from "../auth/AuthContext";
import { BetaMatch, BetaRequest, productionApi } from "../services/ProductionApi";

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  parseSchedule(text: string): Promise<void>;
  explainSelectedMatch(): Promise<void>;
  betaMatches: BetaMatch[];
  betaMatchesBusy: boolean;
  refreshBetaMatches(): Promise<void>;
  betaRequests: BetaRequest[];
  refreshBetaRequests(): Promise<void>;
  sendBetaRequest(recipientId: string): Promise<void>;
  acceptBetaRequest(requestId: string): Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children, gateway }: { children: ReactNode; gateway?: CommuteGateway }) {
  const [state, baseDispatch] = useReducer(appReducer, initialState);
  const [betaMatches, setBetaMatches] = useState<BetaMatch[]>([]);
  const [betaMatchesBusy, setBetaMatchesBusy] = useState(false);
  const [betaRequests, setBetaRequests] = useState<BetaRequest[]>([]);
  const { user } = useAuth();
  const hydratedUser = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dispatch: React.Dispatch<AppAction> = (action) => {
    baseDispatch(action);
    if (!user) return;
    if (action.type === "SAVE_PROFILE" && process.env.EXPO_PUBLIC_DEMO_MODE !== "true") {
      void productionApi.saveBetaProfile(action.profile).catch((reason) => baseDispatch({ type: "SET_NOTICE", notice: reason instanceof Error ? reason.message : "Profile could not be published." }));
    }
    if (action.type === "SAVE_SCHEDULE" && process.env.EXPO_PUBLIC_DEMO_MODE !== "true" && state.parsedSchedule?.shifts) {
      void productionApi.saveBetaSchedule(state.parsedSchedule.shifts).then(() => refreshBetaMatches()).catch((reason) => baseDispatch({ type: "SET_NOTICE", notice: reason instanceof Error ? reason.message : "Schedule could not be published." }));
    }
    if (action.type === "SET_CONSENT" && action.acceptedTerms) {
      void Promise.all([
        productionApi.recordConsent("terms", true),
        productionApi.recordConsent("privacy", true),
        productionApi.recordConsent("schedule", action.schedulePermission),
        productionApi.recordConsent("notifications", action.notificationPermission),
      ]).catch(() => undefined);
    }
    if (action.type === "UPDATE_PERMISSIONS") {
      void Promise.all([
        productionApi.recordConsent("schedule", action.schedulePermission),
        productionApi.recordConsent("notifications", action.notificationPermission),
      ]).catch(() => undefined);
    }
  };
  const activeGateway = useMemo(() => gateway ?? createCommuteGateway(), [gateway]);
  const parseSequence = useRef(0);
  const explanationSequence = useRef(0);
  const explanationContext = useRef({ matchId: state.selectedMatchId, pickupOptionId: state.selectedPickupOptionId });
  explanationContext.current = { matchId: state.selectedMatchId, pickupOptionId: state.selectedPickupOptionId };

  useEffect(() => {
    if (!user || hydratedUser.current === user.uid) return;
    let cancelled = false;
    void productionApi.loadState().then((result) => {
      if (!cancelled && result.state && typeof result.state === "object") {
        baseDispatch({ type: "HYDRATE_ACCOUNT", state: result.state });
      }
      hydratedUser.current = user.uid;
    }).catch((reason) => {
      if (!cancelled) baseDispatch({ type: "SET_NOTICE", notice: reason instanceof Error ? reason.message : "Saved data could not be loaded." });
    });
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user || hydratedUser.current !== user.uid || state.demoMode) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void productionApi.saveState(state).catch(() => undefined);
    }, 700);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [state, user]);

  async function parseSchedule(text: string) {
    const sequence = ++parseSequence.current;
    dispatch({ type: "SET_SCHEDULE_TEXT", text });
    dispatch({ type: "AGENT_STARTED" });
    try {
      const result = await activeGateway.parseSchedule(text);
      if (sequence === parseSequence.current) dispatch({ type: "PARSE_SUCCEEDED", result });
    } catch (reason) {
      if (sequence === parseSequence.current) dispatch({ type: "AGENT_FAILED", message: reason instanceof Error ? reason.message : "The schedule could not be parsed." });
    }
  }

  async function explainSelectedMatch() {
    const sequence = ++explanationSequence.current;
    const requestContext = { matchId: state.selectedMatchId, pickupOptionId: state.selectedPickupOptionId };
    const baseMatch = matches.find((candidate) => candidate.id === state.selectedMatchId);
    if (!baseMatch) return;
    const match = applyPickupOption(baseMatch, state.selectedPickupOptionId);
    const reasonCodes = match.reasonCodes.map((code) => code.startsWith("DETOUR_") ? `DETOUR_${match.detourMinutes}M` : code);
    const facts = match.facts.map((fact) => fact.id === "route"
      ? { ...fact, value: `Pickup adds about ${match.detourMinutes} minutes` }
      : fact.id === "cost" ? { ...fact, value: `${match.suggestedShare} suggested gas and toll contribution per leg` } : fact);
    dispatch({ type: "AGENT_STARTED" });
    try {
      const result = await activeGateway.explainMatch({ reasonCodes, facts });
      if (sequence === explanationSequence.current
        && requestContext.matchId === explanationContext.current.matchId
        && requestContext.pickupOptionId === explanationContext.current.pickupOptionId) {
        dispatch({ type: "EXPLANATION_SUCCEEDED", result });
      }
    } catch (reason) {
      if (sequence === explanationSequence.current
        && requestContext.matchId === explanationContext.current.matchId
        && requestContext.pickupOptionId === explanationContext.current.pickupOptionId) {
        dispatch({ type: "AGENT_FAILED", message: reason instanceof Error ? reason.message : "The match could not be explained." });
      }
    }
  }

  async function refreshBetaMatches() {
    if (!user || process.env.EXPO_PUBLIC_DEMO_MODE === "true") return;
    setBetaMatchesBusy(true);
    try {
      const result = await productionApi.listBetaMatches();
      setBetaMatches(result.matches);
    } catch (reason) {
      baseDispatch({ type: "SET_NOTICE", notice: reason instanceof Error ? reason.message : "Matches could not be loaded." });
    } finally {
      setBetaMatchesBusy(false);
    }
  }

  async function refreshBetaRequests() {
    if (!user || process.env.EXPO_PUBLIC_DEMO_MODE === "true") return;
    try {
      setBetaRequests((await productionApi.listBetaRequests()).requests);
    } catch (reason) {
      baseDispatch({ type: "SET_NOTICE", notice: reason instanceof Error ? reason.message : "Requests could not be loaded." });
    }
  }

  async function sendBetaRequest(recipientId: string) {
    try {
      await productionApi.createBetaRequest(recipientId);
      await refreshBetaRequests();
      baseDispatch({ type: "SET_NOTICE", notice: "Commute request sent. The other tester must accept before meeting details are shared." });
    } catch (reason) {
      baseDispatch({ type: "SET_NOTICE", notice: reason instanceof Error ? reason.message : "The request could not be sent." });
    }
  }

  async function acceptBetaRequest(requestId: string) {
    try {
      await productionApi.acceptBetaRequest(requestId);
      await refreshBetaRequests();
      baseDispatch({ type: "SET_NOTICE", notice: "Request accepted. Confirm a public meeting point together before the commute." });
    } catch (reason) {
      baseDispatch({ type: "SET_NOTICE", notice: reason instanceof Error ? reason.message : "The request could not be accepted." });
    }
  }

  return <AppContext.Provider value={{ state, dispatch, parseSchedule, explainSelectedMatch, betaMatches, betaMatchesBusy, refreshBetaMatches, betaRequests, refreshBetaRequests, sendBetaRequest, acceptBetaRequest }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}
