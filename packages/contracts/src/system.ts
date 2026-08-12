import { Type, type Static } from "@sinclair/typebox";

export const LiveHealthSchema = Type.Object({
  ok: Type.Literal(true),
  service: Type.Literal("got2get2work-api"),
  release: Type.String({ minLength: 1, maxLength: 200 }),
  timestamp: Type.String({ format: "date-time" }),
});

export const ReadyHealthSchema = Type.Object({
  ok: Type.Boolean(),
  service: Type.Literal("got2get2work-api"),
  release: Type.String({ minLength: 1, maxLength: 200 }),
  timestamp: Type.String({ format: "date-time" }),
  checks: Type.Object({
    configuration: Type.Union([Type.Literal("ready"), Type.Literal("degraded")]),
  }),
});

export const PublicConfigSchema = Type.Object({
  environment: Type.Union([
    Type.Literal("development"),
    Type.Literal("staging"),
    Type.Literal("production"),
    Type.Literal("test"),
  ]),
  firebase: Type.Object({
    apiKey: Type.Union([Type.String(), Type.Null()]),
    authDomain: Type.Union([Type.String(), Type.Null()]),
    projectId: Type.Union([Type.String(), Type.Null()]),
    appId: Type.Union([Type.String(), Type.Null()]),
  }),
});

export type LiveHealth = Static<typeof LiveHealthSchema>;
export type ReadyHealth = Static<typeof ReadyHealthSchema>;
export type PublicConfig = Static<typeof PublicConfigSchema>;
