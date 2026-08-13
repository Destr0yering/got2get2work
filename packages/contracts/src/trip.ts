import { Type, type Static } from "@sinclair/typebox";
export const TripDetailSchema = Type.Object({ id: Type.String(), status: Type.Literal("confirmed"), crewDisplayName: Type.String(), captainDisplayName: Type.String(), vehicle: Type.Object({ make: Type.String(), model: Type.String(), color: Type.String(), year: Type.Integer(), plate: Type.String() }), estimate: Type.Object({ amount: Type.Number(), currency: Type.Literal("USD"), voluntary: Type.Literal(true), paymentProcessed: Type.Literal(false) }), confirmedAt: Type.String({ format: "date-time" }) }, { additionalProperties: false });
export const MessageBodySchema = Type.Object({ text: Type.String({ minLength: 1, maxLength: 500 }) }, { additionalProperties: false });
export const MessageSchema = Type.Object({ id: Type.String(), sender: Type.Union([Type.Literal("crew"), Type.Literal("captain")]), text: Type.String(), sentAt: Type.String({ format: "date-time" }) }, { additionalProperties: false });
export const MessageListSchema = Type.Object({ messages: Type.Array(MessageSchema, { maxItems: 100 }) });
export type TripDetail = Static<typeof TripDetailSchema>; export type MessageView = Static<typeof MessageSchema>;
