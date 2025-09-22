/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";
import type * as actions_historicalContext from "../actions/historicalContext.js";
import type * as crons from "../crons.js";
import type * as donations from "../donations.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as migrations_generateMissingContext from "../migrations/generateMissingContext.js";
import type * as migrations_migrateEvents from "../migrations/migrateEvents.js";
import type * as migrations_regenerateHistoricalContextGPT5 from "../migrations/regenerateHistoricalContextGPT5.js";
import type * as puzzles from "../puzzles.js";
import type * as strikeWebhook from "../strikeWebhook.js";
import type * as users from "../users.js";
import type * as webhooks from "../webhooks.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "actions/historicalContext": typeof actions_historicalContext;
  crons: typeof crons;
  donations: typeof donations;
  events: typeof events;
  http: typeof http;
  "migrations/generateMissingContext": typeof migrations_generateMissingContext;
  "migrations/migrateEvents": typeof migrations_migrateEvents;
  "migrations/regenerateHistoricalContextGPT5": typeof migrations_regenerateHistoricalContextGPT5;
  puzzles: typeof puzzles;
  strikeWebhook: typeof strikeWebhook;
  users: typeof users;
  webhooks: typeof webhooks;
}>;
export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>;
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>;
