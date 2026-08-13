export interface MessageRecord { id: string; tripId: string; tenantId: string; senderUid: string; text: string; sentAt: Date }
export interface NotificationRecord { id: string; recipientUid: string; type: "ride_request_ready" | "ride_confirmed" | "new_message"; resourceId: string; createdAt: Date }
export interface PickupStateRecord { tripId: string; status: "confirmed" | "leaving" | "en_route" | "nearby" | "arrived" | "passenger_ready" | "picked_up" | "cancelled"; updatedAt: Date }
export interface ProximityRecord { tripId: string; actorUid: string; state: "nearby" | "not_nearby"; updatedAt: Date; expiresAt: Date }
export interface CompletionRecord { id: string; tripId: string; uid: string; tenantId: string; role: "crew" | "captain"; completed: boolean; shiftProtected: boolean; recordedAt: Date }
export interface RatingRecord { id: string; tripId: string; authorUid: string; subjectUid: string; tenantId: string; punctuality: number; communication: number; safetyComfort: number; respect: number; privateNote: string | null; recordedAt: Date }
export interface SafetyReportRecord { id: string; reporterUid: string; tenantId: string; worksiteId: string; tripId: string | null; subjectUid: string | null; category: string; narrative: string; status: "open"; createdAt: Date }
export class TripError extends Error { constructor(message: string, readonly code: string, readonly statusCode: number) { super(message); this.name = "TripError"; } }
