export interface MessageRecord { id: string; tripId: string; tenantId: string; senderUid: string; text: string; sentAt: Date }
export interface NotificationRecord { id: string; recipientUid: string; type: "ride_request_ready" | "ride_confirmed" | "new_message"; resourceId: string; createdAt: Date }
export interface PickupStateRecord { tripId: string; status: "confirmed" | "leaving" | "en_route" | "nearby" | "arrived" | "passenger_ready" | "picked_up" | "cancelled"; updatedAt: Date }
export interface ProximityRecord { tripId: string; actorUid: string; state: "nearby" | "not_nearby"; updatedAt: Date; expiresAt: Date }
export class TripError extends Error { constructor(message: string, readonly code: string, readonly statusCode: number) { super(message); this.name = "TripError"; } }
