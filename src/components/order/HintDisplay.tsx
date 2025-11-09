"use client";

import { useMemo, useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ANIMATION_DURATIONS, useReducedMotion } from "@/lib/animationConstants";
import { formatYear } from "@/lib/displayFormatting";
import { cn } from "@/lib/utils";
import type { OrderEvent, OrderHint } from "@/types/orderGameState";

type HintType = OrderHint["type"];

const HINT_COPY: Record<
  HintType,
  { label: string; icon: string; description: string; helper: string }
> = {
  anchor: {
    label: "Anchor Hint",
    icon: "🔒",
    description: "Locks the correct event in the right slot.",
    helper: "Best when you are unsure about a specific position.",
  },
  relative: {
    label: "Relative Hint",
    icon: "📊",
    description: "Tells you which of two events happens earlier.",
    helper: "Use to break ties between closely related events.",
  },
  bracket: {
    label: "Bracket Hint",
    icon: "📅",
    description: "Reveals a narrow year range for one event.",
    helper: "Great when you know an event’s era but not the exact spot.",
  },
};

interface HintDisplayProps {
  events: OrderEvent[];
  hints: OrderHint[];
  multiplier: number;
  onRequestHint: (type: HintType) => void;
  disabledTypes?: Partial<Record<HintType, boolean>>;
  pendingType?: HintType | null;
  error?: string | null;
  className?: string;
}

export function HintDisplay({
  events,
  hints,
  multiplier,
  onRequestHint,
  disabledTypes = {},
  pendingType = null,
  error = null,
  className,
}: HintDisplayProps) {
  const panelProps: HintPanelBodyProps = {
    events,
    hints,
    multiplier,
    onRequestHint,
    disabledTypes,
    pendingType,
    error,
  };

  return (
    <div className={cn("space-y-4", className)}>
      <InlineHintPanel {...panelProps} />
      <MobileHintSheet {...panelProps} />
    </div>
  );
}

function InlineHintPanel(props: HintPanelBodyProps) {
  return (
    <section
      aria-labelledby="order-hints-heading"
      className="bg-card/90 hidden rounded-2xl border p-4 shadow-sm md:block"
    >
      <Accordion.Root type="single" defaultValue="order-hints" collapsible>
        <Accordion.Item value="order-hints">
          <Accordion.Header>
            <Accordion.Trigger className="flex w-full items-center justify-between gap-2 text-left text-base font-semibold">
              <div className="flex flex-col">
                <span id="order-hints-heading">Hints</span>
                <span className="text-muted-foreground text-xs font-medium">
                  Keep the multiplier high by limiting hints.
                </span>
              </div>
              <span className="text-muted-foreground text-sm">
                {multiplierLabel(props.multiplier)}
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="pt-4">
            <HintPanelBody {...props} />
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </section>
  );
}

function MobileHintSheet(props: HintPanelBodyProps) {
  const [open, setOpen] = useState(false);
  const hintCountLabel = props.hints.length
    ? `${props.hints.length}/3 hints used`
    : "No hints used yet";

  return (
    <div className="md:hidden">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="bg-card/80 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left shadow-sm"
            aria-label="Open hints panel"
          >
            <div>
              <p className="text-base font-semibold">Hints</p>
              <p className="text-muted-foreground text-xs">{hintCountLabel}</p>
            </div>
            <Badge variant="secondary">{multiplierLabel(props.multiplier)}</Badge>
          </Button>
        </DialogTrigger>
        <DialogContent
          showCloseButton
          className="fixed inset-x-0 top-auto bottom-0 h-[80vh] max-w-none translate-x-0 translate-y-0 rounded-t-3xl border border-b-0 px-0 pt-4 pb-6 shadow-2xl md:hidden"
        >
          <div className="bg-muted mx-auto mb-4 h-1.5 w-16 rounded-full" />
          <div className="px-6">
            <HintPanelBody {...props} variant="mobile" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface HintPanelBodyProps extends HintDisplayProps {
  variant?: "inline" | "mobile";
}

function HintPanelBody({
  events,
  hints,
  multiplier,
  onRequestHint,
  disabledTypes = {},
  pendingType,
  error,
  variant = "inline",
}: HintPanelBodyProps) {
  const hintCountLabel = hints.length ? `${hints.length} of 3 hints used` : "No hints used yet";

  return (
    <div
      className={cn("space-y-4", {
        "pb-2": variant === "mobile",
      })}
    >
      <div className="bg-muted/30 flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
        <div>
          <p className="text-muted-foreground text-xs font-medium uppercase">Current Multiplier</p>
          <p className="text-foreground text-2xl font-semibold">{multiplierLabel(multiplier)}</p>
        </div>
        <Badge variant="outline" className="text-xs font-medium">
          {hintCountLabel}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(HINT_COPY) as HintType[]).map((type) => (
          <HintOptionButton
            key={type}
            type={type}
            disabled={Boolean(disabledTypes[type])}
            pending={pendingType === type}
            onSelect={onRequestHint}
          />
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-foreground text-sm font-semibold">Hints Taken</p>
        <HintHistoryList events={events} hints={hints} />
        {error ? (
          <p role="status" className="text-destructive text-sm">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

interface HintOptionButtonProps {
  type: HintType;
  disabled: boolean;
  pending: boolean;
  onSelect: (type: HintType) => void;
}

function HintOptionButton({ type, disabled, pending, onSelect }: HintOptionButtonProps) {
  const copy = HINT_COPY[type];
  return (
    <button
      type="button"
      className={cn(
        "border-border focus-visible:ring-ring bg-background flex h-full flex-col rounded-2xl border px-4 py-3 text-left shadow-sm transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        disabled && "cursor-not-allowed opacity-40",
      )}
      onClick={() => onSelect(type)}
      disabled={disabled || pending}
      aria-label={`Take ${copy.label}`}
    >
      <span aria-hidden="true" className="text-2xl">
        {copy.icon}
      </span>
      <span className="text-foreground mt-2 text-sm font-semibold">{copy.label}</span>
      <span className="text-muted-foreground mt-1 text-xs">{copy.description}</span>
      <span className="text-muted-foreground/80 mt-2 text-xs">{copy.helper}</span>
      {pending ? (
        <span className="text-primary mt-3 flex items-center gap-2 text-xs font-medium">
          <LoadingSpinner className="size-3" />
          Preparing hint…
        </span>
      ) : null}
    </button>
  );
}

interface HintHistoryListProps {
  events: OrderEvent[];
  hints: OrderHint[];
}

function HintHistoryList({ events, hints }: HintHistoryListProps) {
  const shouldReduceMotion = useReducedMotion();
  const eventsById = useMemo(() => new Map(events.map((event) => [event.id, event])), [events]);

  if (!hints.length) {
    return (
      <p className="text-muted-foreground text-sm">
        No hints used yet. Keep that multiplier at 100%!
      </p>
    );
  }

  return (
    <ul className="space-y-2" aria-live="polite">
      <LayoutGroup>
        <AnimatePresence initial={false}>
          {hints.map((hint) => {
            const description = describeHint(hint, eventsById);
            return (
              <motion.li
                key={serializeHint(hint)}
                layout={!shouldReduceMotion}
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.98 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
                transition={{
                  duration: ANIMATION_DURATIONS.HINT_TRANSITION / 1000,
                  layout: {
                    duration: shouldReduceMotion ? 0 : ANIMATION_DURATIONS.HINT_TRANSITION / 1000,
                  },
                }}
                className="border-border bg-muted/30 flex items-start gap-3 rounded-2xl border px-3 py-3"
              >
                <span aria-hidden="true" className="text-lg">
                  {HINT_COPY[hint.type].icon}
                </span>
                <div>
                  <p className="text-foreground text-sm font-semibold">{description.title}</p>
                  <p className="text-muted-foreground text-xs">{description.subtitle}</p>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </LayoutGroup>
    </ul>
  );
}

function describeHint(
  hint: OrderHint,
  eventsById: Map<string, OrderEvent>,
): { title: string; subtitle: string } {
  switch (hint.type) {
    case "anchor": {
      const eventName = eventsById.get(hint.eventId)?.text ?? hint.eventId;
      return {
        title: eventName,
        subtitle: `Locked into position ${hint.position + 1}`,
      };
    }
    case "relative": {
      const earlier = eventsById.get(hint.earlierEventId)?.text ?? hint.earlierEventId;
      const later = eventsById.get(hint.laterEventId)?.text ?? hint.laterEventId;
      return {
        title: earlier,
        subtitle: `Occurs before ${later}`,
      };
    }
    case "bracket": {
      const eventName = eventsById.get(hint.eventId)?.text ?? hint.eventId;
      return {
        title: eventName,
        subtitle: `Between ${formatYearSafe(hint.yearRange[0])} – ${formatYearSafe(hint.yearRange[1])}`,
      };
    }
    default:
      return {
        title: "Hint applied",
        subtitle: "Details unavailable",
      };
  }
}

function serializeHint(hint: OrderHint): string {
  switch (hint.type) {
    case "anchor":
      return `anchor:${hint.eventId}:${hint.position}`;
    case "relative":
      return `relative:${hint.earlierEventId}:${hint.laterEventId}`;
    case "bracket":
      return `bracket:${hint.eventId}:${hint.yearRange.join("-")}`;
    default:
      return JSON.stringify(hint);
  }
}

function multiplierLabel(multiplier: number): string {
  return `${multiplier.toFixed(2)}×`;
}

function formatYearSafe(year: number): string {
  try {
    return formatYear(year);
  } catch {
    return `${year}`;
  }
}
