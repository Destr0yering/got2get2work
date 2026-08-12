import { Type, type Static } from "@sinclair/typebox";

export const CorrelationIdSchema = Type.String({
  minLength: 8,
  maxLength: 128,
  description: "Request correlation identifier safe to include in support messages.",
});

export const ErrorDetailSchema = Type.Object({
  field: Type.String({ minLength: 1, maxLength: 128 }),
  message: Type.String({ minLength: 1, maxLength: 300 }),
});

export const ErrorEnvelopeSchema = Type.Object({
  error: Type.Object({
    code: Type.String({ minLength: 1, maxLength: 80 }),
    message: Type.String({ minLength: 1, maxLength: 300 }),
    correlationId: CorrelationIdSchema,
    retryable: Type.Boolean(),
    fields: Type.Optional(Type.Array(ErrorDetailSchema, { maxItems: 20 })),
  }),
});

export type ErrorEnvelope = Static<typeof ErrorEnvelopeSchema>;
