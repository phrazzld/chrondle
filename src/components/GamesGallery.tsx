"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Check, Crosshair, Shuffle } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MODE_COOKIE = "chrondle_mode";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

type ModeKey = "classic" | "order";

type ModeCardConfig = {
  key: ModeKey;
  title: string;
  subtitle: string;
  description: string;
  route: string;
  icon: LucideIcon;
  accentClass: string;
  highlights: string[];
  badge?: string;
};

const MODE_CARDS: ModeCardConfig[] = [
  {
    key: "classic",
    title: "Classic",
    subtitle: "Guess the Year",
    description: "Use progressive hints to lock in the exact year for a single event each day.",
    route: "/classic",
    icon: Crosshair,
    accentClass: "text-amber-500",
    highlights: [
      "Six escalating hints per puzzle",
      "Score streaks + precision bonuses",
      "Perfect for history buffs who love exact dates",
    ],
  },
  {
    key: "order",
    title: "Order",
    subtitle: "Arrange Events",
    description:
      "Drag or tap to arrange six events in chronological order—points for every correct pair.",
    route: "/order",
    icon: Shuffle,
    accentClass: "text-sky-500",
    highlights: [
      "Three smart hints (anchor, relative, bracket)",
      "Pairwise scoring keeps tension high",
      "Designed for pattern finders and timeline lovers",
    ],
    badge: "New",
  },
];

function setModePreferenceCookie(mode: ModeKey) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${MODE_COOKIE}=${mode}; max-age=${ONE_YEAR_SECONDS}; path=/; SameSite=Lax`;
}

type ModeCardProps = {
  config: ModeCardConfig;
  onSelect: (mode: ModeKey, route: string) => void;
};

function ModeCard({ config, onSelect }: ModeCardProps) {
  const titleId = `${config.key}-mode-title`;
  const descriptionId = `${config.key}-mode-description`;
  const Icon = config.icon;

  return (
    <Card
      role="region"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="border-border/80 bg-card/90 supports-[backdrop-filter]:bg-card/75 flex h-full flex-col justify-between border px-6 pt-5 pb-6 shadow-sm backdrop-blur"
    >
      <CardHeader className="gap-3 px-0 pb-0">
        <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
          <span
            aria-hidden="true"
            className={cn(
              "bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full border",
              config.accentClass,
            )}
          >
            <Icon className="size-5" />
          </span>
          <span>{config.subtitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <CardTitle id={titleId} className="text-2xl">
            {config.title}
          </CardTitle>
          {config.badge ? <Badge variant="secondary">{config.badge}</Badge> : null}
        </div>
        <CardDescription id={descriptionId} className="text-base leading-relaxed">
          {config.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 pt-4 pb-6">
        <ul className="text-muted-foreground flex flex-col gap-3 text-sm">
          {config.highlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-2">
              <Check className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="px-0">
        <Button
          type="button"
          size="lg"
          className="w-full rounded-full"
          aria-describedby={descriptionId}
          onClick={() => onSelect(config.key, config.route)}
        >
          Play {config.title}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function GamesGallery() {
  const router = useRouter();

  const handleSelect = useCallback(
    (mode: ModeKey, route: string) => {
      setModePreferenceCookie(mode);
      router.push(route);
    },
    [router],
  );

  return (
    <main className="relative isolate flex min-h-screen flex-col justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.08),transparent_50%)] px-6 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-5 text-center">
        <p className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
          Choose Your Challenge
        </p>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome to Chrondle
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
          Pick a mode to get started. We will remember your favorite so returning visits land
          directly where you left off.
        </p>
      </div>

      <section className="mx-auto mt-10 grid w-full max-w-5xl gap-6 md:grid-cols-2">
        {MODE_CARDS.map((mode) => (
          <ModeCard key={mode.key} config={mode} onSelect={handleSelect} />
        ))}
      </section>
    </main>
  );
}
