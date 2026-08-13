import type { MessageRecord, NotificationRecord } from "./domain";
export interface TripStore { listMessages(tripId: string, limit: number): Promise<MessageRecord[]>; saveMessage(message: MessageRecord, notification: NotificationRecord): Promise<MessageRecord>; }
