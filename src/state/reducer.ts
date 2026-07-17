import { defaultScheduleText } from "../data/demoSeed";
import { AppState } from "../domain/models";
import { transitionTrip } from "../domain/tripMachine";
import { AppAction } from "./actions";

export function createInitialState(): AppState {
  return {
    route: "welcome",
    activeTab: "today",
    actorId: "maya",
    acceptedTerms: false,
    termsReviewed: false,
    privacyReviewed: false,
    schedulePermission: false,
    notificationPermission: false,
    demoMode: false,
    profile: {
      displayName: "Maya",
      areaLabel: "Pine St & 4th Ave",
      role: "passenger",
      toWorkRole: "passenger",
      homeRole: "passenger",
      maxDetourMinutes: 10,
      seats: 1
    },
    scheduleText: defaultScheduleText,
    parsedSchedule: null,
    selectedMatchId: "match-jordan",
    selectedPickupOptionId: "library",
    matchScenario: "matches",
    matchExplanation: null,
    agentBusy: false,
    agentError: null,
    trip: { id: "trip-tuesday", status: "needs_plan" },
    rideMessages: [],
    relationshipPreference: null,
    blockedMatchIds: [],
    appearances: {
      maya: { avatarId: "sun", vehicleColorId: "green", vehicleType: "Hatchback", vehicleNickname: "Maya's car" },
      jordan: { avatarId: "leaf", vehicleColorId: "blue", vehicleType: "Compact SUV", vehicleNickname: "Bluebird" }
    },
    proximityOptIn: { maya: false, jordan: false },
    vehicleApproachStatus: "waiting",
    passengerAtPickup: false,
    notice: null,
    demoControlsOpen: false
  };
}

export const initialState = createInitialState();

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "NAVIGATE":
      return { ...state, route: action.route, notice: null };
    case "SET_TAB":
      return { ...state, route: "main", activeTab: action.tab, notice: null };
    case "SET_CONSENT":
      if (!action.acceptedTerms || !state.termsReviewed || !state.privacyReviewed) {
        return { ...state, route: "privacy", acceptedTerms: false, notice: "Open both policy documents, then accept them to continue. Optional permissions can stay off." };
      }
      return {
        ...state,
        acceptedTerms: action.acceptedTerms,
        schedulePermission: action.schedulePermission,
        notificationPermission: action.notificationPermission,
        route: "profile-setup"
      };
    case "REVIEW_POLICY":
      return {
        ...state,
        termsReviewed: state.termsReviewed || action.kind === "terms",
        privacyReviewed: state.privacyReviewed || action.kind === "privacy",
        route: action.kind === "terms" ? "terms" : "privacy-policy",
        notice: null
      };
    case "UPDATE_PERMISSIONS":
      return {
        ...state,
        schedulePermission: action.schedulePermission,
        notificationPermission: action.notificationPermission,
        notice: "Optional demo preferences updated. No external account was connected."
      };
    case "SAVE_PROFILE":
      return { ...state, profile: action.profile, route: "schedule-agent" };
    case "SET_SCHEDULE_TEXT":
      return { ...state, scheduleText: action.text };
    case "AGENT_STARTED":
      return { ...state, agentBusy: true, agentError: null, matchExplanation: null };
    case "PARSE_SUCCEEDED":
      return { ...state, parsedSchedule: action.result, agentBusy: false, route: "schedule-review" };
    case "EXPLANATION_SUCCEEDED":
      return { ...state, matchExplanation: action.result, agentBusy: false, agentError: null };
    case "AGENT_FAILED":
      return { ...state, agentBusy: false, agentError: action.message };
    case "SAVE_SCHEDULE": {
      const shiftCount = state.parsedSchedule?.shifts.length ?? 0;
      const firstPlan = state.trip.status === "needs_plan";
      const roleAwareNotice = state.profile.toWorkRole !== state.profile.homeRole
        ? `${shiftCount} shifts saved. Your to-work and home roles remain separate.`
        : state.profile.toWorkRole === "driver"
          ? `${shiftCount} shifts saved. Driver availability is ready; no passenger request is waiting yet.`
          : `${shiftCount} shifts saved. Two round-trip driver fits are ready.`;
      return {
        ...state,
        route: "main",
        activeTab: "today",
        trip: firstPlan
          ? { ...state.trip, status: transitionTrip(state.trip.status, "options_ready") }
          : state.trip,
        notice: firstPlan ? roleAwareNotice : `${shiftCount} shifts updated. Your active commute plan was left unchanged.`
      };
    }
    case "SELECT_MATCH":
      return { ...state, selectedMatchId: action.matchId, route: "match-detail", matchExplanation: null, agentBusy: false, agentError: null };
    case "SELECT_PICKUP_OPTION":
      if (state.actorId !== "maya" || state.trip.status !== "options_ready" || state.selectedMatchId !== "match-jordan") {
        return { ...state, notice: "The pickup is locked after a request. A production change would require both coworkers to approve again." };
      }
      return { ...state, selectedPickupOptionId: action.pickupOptionId, matchExplanation: null, agentBusy: false, agentError: null, notice: "Proposed public pickup updated for both demo coworkers." };
    case "SET_MATCH_SCENARIO":
      return { ...state, matchScenario: action.scenario, route: "main", activeTab: action.scenario === "none" ? "matches" : state.activeTab, demoControlsOpen: false, notice: action.scenario === "none" ? "Scarce-supply scenario enabled." : "Compatible demo matches restored." };
    case "SEND_REQUEST":
      if (state.actorId !== "maya" || state.trip.status !== "options_ready" || state.matchScenario === "none") {
        return { ...state, notice: "Only Maya can send one request while the commute is still open." };
      }
      if (state.selectedMatchId !== "match-jordan") {
        return { ...state, notice: "Avery is reserved as a standing recovery offer in this demo. Request Jordan to continue the primary flow." };
      }
      return {
        ...state,
        trip: { ...state.trip, status: transitionTrip(state.trip.status, "request_pending"), activeMatchId: state.selectedMatchId, requesterId: "maya", requestedDriverId: "jordan" },
        route: "main",
        activeTab: "today",
        notice: "Request sent to Jordan. No meeting point was shared yet."
      };
    case "SWITCH_ACTOR":
      return { ...state, actorId: action.actorId, route: state.route === "pickup-tracker" ? "pickup-tracker" : "main", activeTab: "today", demoControlsOpen: false, notice: `Demo switched to ${action.actorId === "maya" ? "Maya" : "Jordan"}.` };
    case "ACCEPT_REQUEST":
      if (state.trip.status !== "request_pending") {
        return { ...state, notice: "There is no pending request to accept." };
      }
      if (state.actorId !== state.trip.requestedDriverId || state.actorId === state.trip.requesterId) {
        return { ...state, notice: "Only the requested driver can accept. Switch the demo to Jordan to continue." };
      }
      return {
        ...state,
        trip: { ...state.trip, status: transitionTrip(state.trip.status, "confirmed") },
        notice: "Ride accepted. The meeting point and vehicle details are now shared."
      };
    case "CANCEL_RIDE":
      return {
        ...state,
        actorId: "maya",
        route: "main",
        activeTab: "today",
        trip: {
          ...state.trip,
          status: transitionTrip(state.trip.status, "cancelled"),
          cancelledDriverName: "Jordan L."
        },
        proximityOptIn: { maya: false, jordan: false },
        vehicleApproachStatus: "waiting",
        passengerAtPickup: false,
        notice: "Jordan cancelled. Got2Get2Work found a compatible backup."
      };
    case "OPEN_RECOVERY":
      return {
        ...state,
        route: "recovery",
        trip: { ...state.trip, status: transitionTrip(state.trip.status, "recovery_ready") },
        notice: null
      };
    case "ACCEPT_BACKUP_OFFER":
      if (state.actorId !== "maya" || state.trip.status !== "recovery_ready") {
        return { ...state, notice: "Only Maya can accept the active standing backup offer during recovery." };
      }
      return {
        ...state,
        route: "main",
        activeTab: "today",
        selectedMatchId: "match-avery",
        trip: { ...state.trip, status: transitionTrip(state.trip.status, "recovered"), activeMatchId: "match-avery" },
        notice: "You accepted Avery’s standing backup offer. Your commute is ready."
      };
    case "COMPLETE_RIDE":
      return {
        ...state,
        trip: { ...state.trip, status: transitionTrip(state.trip.status, "completed") },
        notice: "Commute complete. Thanks for looking out for a coworker."
      };
    case "SEND_RIDE_MESSAGE": {
      const text = action.text.trim();
      if (!text) return state;
      return {
        ...state,
        rideMessages: [...state.rideMessages, { id: `message-${state.rideMessages.length + 1}`, matchId: state.trip.activeMatchId ?? state.selectedMatchId, senderId: state.actorId, text }],
        notice: "Message saved in this local demo thread."
      };
    }
    case "SET_RELATIONSHIP_PREFERENCE":
      if (state.trip.status !== "completed") return { ...state, notice: "Complete the commute before setting a future coworker preference." };
      return {
        ...state,
        relationshipPreference: action.preference,
        blockedMatchIds: action.preference === "blocked" && state.trip.activeMatchId && !state.blockedMatchIds.includes(state.trip.activeMatchId)
          ? [...state.blockedMatchIds, state.trip.activeMatchId]
          : state.blockedMatchIds,
        notice: action.preference === "again"
          ? "Ride-again preference saved in local demo state."
          : action.preference === "preferred" ? "Preferred coworker saved and ranked first in local demo state." : "This coworker is excluded from future local demo matching; other compatible coworkers remain available."
      };
    case "UPDATE_APPEARANCE": {
      const vehicleNickname = action.appearance.vehicleNickname.trim().slice(0, 24) || "My car";
      return {
        ...state,
        route: "main",
        activeTab: "profile",
        appearances: { ...state.appearances, [state.actorId]: { ...action.appearance, vehicleNickname } },
        notice: `${state.actorId === "maya" ? "Maya's" : "Jordan's"} pickup identity was updated locally.`
      };
    }
    case "SET_PROXIMITY_OPT_IN": {
      const primaryRideConfirmed = state.trip.status === "confirmed" && state.trip.activeMatchId === "match-jordan";
      if (!primaryRideConfirmed) {
        return { ...state, notice: "Pickup proximity is available only for the confirmed Jordan demo ride." };
      }
      return {
        ...state,
        proximityOptIn: { ...state.proximityOptIn, [state.actorId]: action.enabled },
        passengerAtPickup: state.actorId === "maya" && !action.enabled ? false : state.passengerAtPickup,
        vehicleApproachStatus: state.actorId === "jordan" && !action.enabled ? "waiting" : state.vehicleApproachStatus,
        notice: action.enabled
          ? "Foreground pickup proximity enabled for this fictional ride. The other coworker must opt in separately."
          : "Pickup proximity stopped for this coworker."
      };
    }
    case "SET_PASSENGER_AT_PICKUP": {
      const mutual = state.proximityOptIn.maya && state.proximityOptIn.jordan;
      if (state.actorId !== "maya" || state.trip.status !== "confirmed" || state.trip.activeMatchId !== "match-jordan" || !mutual) {
        return { ...state, notice: "Maya can share pickup presence only after both coworkers enable proximity." };
      }
      return { ...state, passengerAtPickup: action.present, notice: action.present ? "Maya is sharing a nearby pickup-presence signal." : "Maya stopped sharing pickup presence." };
    }
    case "ADVANCE_VEHICLE_APPROACH": {
      const mutual = state.proximityOptIn.maya && state.proximityOptIn.jordan;
      if (state.actorId !== "jordan" || state.trip.status !== "confirmed" || state.trip.activeMatchId !== "match-jordan" || !mutual) {
        return { ...state, notice: "Jordan can update the approach only after both coworkers enable proximity." };
      }
      const next = state.vehicleApproachStatus === "waiting" ? "en_route"
        : state.vehicleApproachStatus === "en_route" ? "nearby"
          : state.vehicleApproachStatus === "nearby" ? "arrived" : "arrived";
      const label = next === "en_route" ? "Jordan started the approach demo." : next === "nearby" ? "Jordan is now within the nearby demo zone." : "Jordan marked the vehicle at the public pickup.";
      return { ...state, vehicleApproachStatus: next, notice: label };
    }
    case "SET_NOTICE":
      return { ...state, notice: action.notice };
    case "SET_DEMO_CONTROLS":
      return { ...state, demoControlsOpen: action.open };
    case "SKIP_TO_DEMO":
      return {
        ...state,
        route: "main",
        activeTab: "today",
        acceptedTerms: false,
        schedulePermission: false,
        notificationPermission: false,
        demoMode: true,
        trip: { ...state.trip, status: "options_ready" },
        notice: "Demo ready. Two coworker fits were prepared locally."
      };
    case "RESET_DEMO":
      return createInitialState();
    default:
      return state;
  }
}
