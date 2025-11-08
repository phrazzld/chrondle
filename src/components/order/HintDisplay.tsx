"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { Fragment } from "react";
import type { OrderHint } from "@/types/orderGameState";

type HintType = "anchor" | "relative" | "bracket";

interface HintDisplayProps {
  hints: OrderHint[];
  multiplier: number;
  onRequestHint: (type: HintType) => void;
  disabledTypes?: Partial<Record<HintType, boolean>>;
}

const HINT_OPTIONS: Array<{ type: HintType; label: string; icon: string; description: string }> = [
  {
    type: "anchor",
    label: "Anchor Hint",
    icon: "🔒",
    description: "Locks an event into the correct position in the list.",
  },
  {
    type: "relative",
    label: "Relative Hint",
    icon: "📊",
    description: "Tells you which of two events happens earlier in history.",
  },
  {
    type: "bracket",
    label: "Bracket Hint",
    icon: "📅",
    description: "Gives you a year range for one of the events.",
  },
];

export function HintDisplay({
  hints,
  multiplier,
  onRequestHint,
  disabledTypes = {},
}: HintDisplayProps) {
  return (
    <section className="border-border bg-card rounded-2xl border p-4 text-left shadow-sm">
      <Accordion.Root type="single" collapsible defaultValue="hints">
        <Accordion.Item value="hints">
          <Accordion.Header>
            <Accordion.Trigger className="text-foreground flex w-full items-center justify-between text-left text-base font-semibold">
              <span>Hints</span>
              <span className="text-muted-foreground text-sm">
                Multiplier {multiplier.toFixed(2)}×
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="mt-4 space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Take another hint:</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {HINT_OPTIONS.map((hint) => (
                  <button
                    key={hint.type}
                    type="button"
                    disabled={disabledTypes[hint.type]}
                    onClick={() => onRequestHint(hint.type)}
                    className="border-border bg-background hover:bg-muted flex flex-col rounded-xl border px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="text-lg">{hint.icon}</span>
                    <span className="text-foreground font-medium">{hint.label}</span>
                    <span className="text-muted-foreground text-xs">{hint.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-foreground text-sm font-semibold">Hints Taken</p>
              {hints.length === 0 ? (
                <p className="text-muted-foreground mt-2 text-sm">No hints used yet.</p>
              ) : (
                <ul className="text-muted-foreground mt-2 space-y-2 text-sm">
                  {hints.map((hint, idx) => (
                    <li key={`${hint.type}-${idx}`} className="bg-muted/60 rounded-xl px-3 py-2">
                      <HintDescription hint={hint} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </section>
  );
}

function HintDescription({ hint }: { hint: OrderHint }) {
  switch (hint.type) {
    case "anchor":
      return (
        <span>
          🔒 Event <strong>{hint.eventId}</strong> is locked at position {hint.position + 1}.
        </span>
      );
    case "relative":
      return (
        <span>
          📊 Event <strong>{hint.earlierEventId}</strong> happens before{" "}
          <strong>{hint.laterEventId}</strong>.
        </span>
      );
    case "bracket":
      return (
        <span>
          📅 Event <strong>{hint.eventId}</strong> occurred between {hint.yearRange[0]} and{" "}
          {hint.yearRange[1]}.
        </span>
      );
    default:
      return <Fragment>Hint applied.</Fragment>;
  }
}
