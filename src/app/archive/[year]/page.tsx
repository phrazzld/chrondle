import { redirect } from "next/navigation";
import { getPuzzleByYear } from "@/lib/puzzleData";

export default function ArchiveGamePage({
  params,
}: {
  params: { year: string };
}) {
  const year = parseInt(params.year);

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
