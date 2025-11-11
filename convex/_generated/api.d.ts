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
import type * as events from "../events.js";
import type * as lib_migrationHelpers from "../lib/migrationHelpers.js";
import type * as lib_puzzleHelpers from "../lib/puzzleHelpers.js";
import type * as lib_puzzleType from "../lib/puzzleType.js";
import type * as lib_streakCalculation from "../lib/streakCalculation.js";
import type * as lib_streakHelpers from "../lib/streakHelpers.js";
import type * as migration_anonymous from "../migration/anonymous.js";
import type * as migrations_generateMissingContext from "../migrations/generateMissingContext.js";
import type * as migrations_migrateEvents from "../migrations/migrateEvents.js";
import type * as migrations_regenerateHistoricalContextGPT5 from "../migrations/regenerateHistoricalContextGPT5.js";
import type * as plays_queries from "../plays/queries.js";
import type * as puzzles_context from "../puzzles/context.js";
import type * as puzzles_generation from "../puzzles/generation.js";
import type * as puzzles_mutations from "../puzzles/mutations.js";
import type * as puzzles_queries from "../puzzles/queries.js";
import type * as puzzles from "../puzzles.js";
import type * as system_scheduling from "../system/scheduling.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";
import type * as users_statistics from "../users/statistics.js";
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
  "lib/migrationHelpers": typeof lib_migrationHelpers;
  "lib/puzzleHelpers": typeof lib_puzzleHelpers;
  "lib/puzzleType": typeof lib_puzzleType;
  "lib/streakCalculation": typeof lib_streakCalculation;
  "lib/streakHelpers": typeof lib_streakHelpers;
  "migration/anonymous": typeof migration_anonymous;
  "migrations/generateMissingContext": typeof migrations_generateMissingContext;
  "migrations/migrateEvents": typeof migrations_migrateEvents;
  "migrations/regenerateHistoricalContextGPT5": typeof migrations_regenerateHistoricalContextGPT5;
  "plays/queries": typeof plays_queries;
  "puzzles/context": typeof puzzles_context;
  "puzzles/generation": typeof puzzles_generation;
  "puzzles/mutations": typeof puzzles_mutations;
  "puzzles/queries": typeof puzzles_queries;
  puzzles: typeof puzzles;
  "system/scheduling": typeof system_scheduling;
  "users/mutations": typeof users_mutations;
  "users/queries": typeof users_queries;
  "users/statistics": typeof users_statistics;
  users: typeof users;
}>;
export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>;
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>;
