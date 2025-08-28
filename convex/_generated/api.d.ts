/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as actions_historicalContext from "../actions/historicalContext.js";
import type * as crons from "../crons.js";
import type * as events from "../events.js";
import type * as migrations_generateMissingContext from "../migrations/generateMissingContext.js";
import type * as migrations_migrateEvents from "../migrations/migrateEvents.js";
import type * as puzzles from "../puzzles.js";
import type * as users from "../users.js";

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
  events: typeof events;
  "migrations/generateMissingContext": typeof migrations_generateMissingContext;
  "migrations/migrateEvents": typeof migrations_migrateEvents;
  puzzles: typeof puzzles;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
