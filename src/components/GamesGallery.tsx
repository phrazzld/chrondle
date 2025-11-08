"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

const MODE_COOKIE = "chrondle_mode";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

type ModeKey = "classic" | "order";

const MODES: Array<{
  key: ModeKey;
  title: string;
  description: string;
  route: string;
}> = [
  {
    key: "classic",
    title: "Classic",
    description: "Guess the exact year using progressive historical clues.",
    route: "/classic",
  },
  {
    key: "order",
    title: "Order",
    description: "Arrange six events chronologically to test your historical intuition.",
    route: "/order",
  },
];

export function GamesGallery() {
  const router = useRouter();

  const handleSelect = useCallback(
    (mode: ModeKey, route: string) => {
      document.cookie = `${MODE_COOKIE}=${mode}; max-age=${ONE_YEAR_SECONDS}; path=/; SameSite=Lax`;
      router.push(route);
    },
    [router],
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div>
        <p className="text-muted-foreground text-sm tracking-wide uppercase">
          Choose Your Challenge
        </p>
        <h1 className="text-foreground mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome to Chrondle
        </h1>
        <p className="text-muted-foreground mt-4 text-base sm:text-lg">
          Pick a mode to get started. We&apos;ll remember your preference for next time.
        </p>
      </div>

      <section className="grid w-full gap-6 md:grid-cols-2">
        {MODES.map((mode) => (
          <article
            key={mode.key}
            className="border-border bg-card flex flex-col justify-between rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div>
              <h2 className="text-foreground text-xl font-semibold">{mode.title}</h2>
              <p className="text-muted-foreground mt-2 text-sm">{mode.description}</p>
            </div>
            <button
              type="button"
              onClick={() => handleSelect(mode.key, mode.route)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary mt-6 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Play {mode.title}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
