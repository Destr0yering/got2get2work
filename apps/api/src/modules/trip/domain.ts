export interface MessageRecord { id: string; tripId: string; tenantId: string; senderUid: string; text: string; sentAt: Date }
export interface NotificationRecord { id: string; recipientUid: string; type: "ride_request_ready" | "ride_confirmed" | "new_message"; resourceId: string; createdAt: Date }
export class TripError extends Error { constructor(message: string, readonly code: string, readonly statusCode: number) { super(message); this.name = "TripError"; } }
