import { redirect } from "next/navigation";
import { getPuzzleByYear } from "@/lib/puzzleData";

export default async function ArchiveGamePage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: yearString } = await params;
  const year = parseInt(yearString);

  if (isNaN(year)) {
    return redirect("/archive");
  }

  const puzzle = getPuzzleByYear(year);

  if (!puzzle) {
    return redirect("/archive");
  }

  return (
    <div>
      Archive Game Page for year {year} - {puzzle.events.length} events
    </div>
  );
}
