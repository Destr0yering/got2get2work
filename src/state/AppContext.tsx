import React, { createContext, ReactNode, useContext, useMemo, useReducer, useRef } from "react";

import { applyPickupOption, matches } from "../data/demoSeed";
import { AppState } from "../domain/models";
import { CommuteGateway } from "../services/CommuteGateway";
import { createCommuteGateway } from "../services/HttpCommuteGateway";
import { AppAction } from "./actions";
import { appReducer, initialState } from "./reducer";

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  parseSchedule(text: string): Promise<void>;
  explainSelectedMatch(): Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children, gateway }: { children: ReactNode; gateway?: CommuteGateway }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const activeGateway = useMemo(() => gateway ?? createCommuteGateway(), [gateway]);
  const parseSequence = useRef(0);
  const explanationSequence = useRef(0);
  const explanationContext = useRef({ matchId: state.selectedMatchId, pickupOptionId: state.selectedPickupOptionId });
  explanationContext.current = { matchId: state.selectedMatchId, pickupOptionId: state.selectedPickupOptionId };

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

  return <AppContext.Provider value={{ state, dispatch, parseSchedule, explainSelectedMatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}
