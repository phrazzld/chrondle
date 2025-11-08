"use client";

import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, useReducedMotion } from "motion/react";
import type { OrderEvent, OrderHint } from "@/types/orderGameState";

interface DraggableEventCardProps {
  event: OrderEvent;
  index: number;
  isLocked?: boolean;
  activeHints?: OrderHint[];
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function DraggableEventCard({
  event,
  index,
  isLocked = false,
  activeHints = [],
  onMoveUp,
  onMoveDown,
}: DraggableEventCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: event.id,
    disabled: isLocked,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: prefersReducedMotion ? undefined : transition,
  };

  const hints = useMemo(() => describeHints(activeHints), [activeHints]);

  return (
    <motion.li
      layout
      ref={setNodeRef}
      style={style}
      className={[
        "border-border bg-card relative flex items-center justify-between rounded-2xl border px-4 py-3 text-left shadow-sm transition",
        isDragging ? "border-primary z-20 shadow-xl" : "",
        isLocked ? "opacity-75" : "",
      ].join(" ")}
      {...attributes}
    >
      <div className="flex flex-1 items-center gap-3">
        <button
          type="button"
          className="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-primary rounded-full border px-2 py-1 text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          aria-label="Drag handle"
          {...listeners}
          disabled={isLocked}
        >
          ⠿
        </button>
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">#{index + 1}</p>
          <p className="text-foreground text-base font-semibold">{event.text}</p>
          <p className="text-muted-foreground text-sm">{event.year}</p>
          {hints.length > 0 && (
            <ul className="text-muted-foreground mt-1 flex flex-wrap gap-2 text-xs">
              {hints.map((hint, idx) => (
                <li
                  key={idx}
                  className="bg-muted inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                >
                  <span>{hint.icon}</span>
                  <span>{hint.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isLocked}
          className="border-border text-foreground hover:bg-muted rounded-full border px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Move ${event.text} up`}
        >
          ↑
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLocked}
          className="border-border text-foreground hover:bg-muted rounded-full border px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Move ${event.text} down`}
        >
          ↓
        </button>
      </div>
    </motion.li>
  );
}

function describeHints(hints: OrderHint[]) {
  return hints.map((hint) => {
    switch (hint.type) {
      case "anchor":
        return { icon: "🔒", label: `Locked at ${hint.position + 1}` };
      case "relative":
        return { icon: "📊", label: `${hint.earlierEventId} before ${hint.laterEventId}` };
      case "bracket":
        return { icon: "📅", label: `${hint.yearRange[0]}–${hint.yearRange[1]}` };
      default:
        return { icon: "💡", label: "Hint applied" };
    }
  });
}
