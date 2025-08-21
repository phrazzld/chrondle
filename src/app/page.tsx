// Server Component - No "use client" directive
// This component fetches puzzle data server-side and passes it to the client island

import { preloadQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { GameIsland } from "@/components/GameIsland";

export default async function ChronldePage() {
  // Preload puzzle data server-side (no auth needed for the daily puzzle)
  // This eliminates the loading-puzzle state completely
  const preloadedPuzzle = await preloadQuery(api.puzzles.getDailyPuzzle);

  return <GameIsland preloadedPuzzle={preloadedPuzzle} />;
}
