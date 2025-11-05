# Repository Guidelines

## Project Structure & Module Organization

- `src/app` houses Next.js route groups per layout; `src/components` stores UI modules (PascalCase files, scoped folders like `ui/`, `providers/`); `src/lib` keeps domain logic and shared utilities; `src/hooks` for stateful abstractions.
- Convex backend logic lives in `convex/` (mutations, cron, schema). Shared types reside in `src/types`; Tailwind tokens live in `src/styles`; static assets in `public/`; scripts and quality checks in `scripts/`.
- Tests colocate with features (`src/components/__tests__`, `src/test/setup.ts`); end-to-end scaffolding sits in `e2e/`; operational playbooks and ADRs live in `docs/`.

## Build, Test, and Development Commands

- Use `pnpm install` (guarded by `npx only-allow pnpm`) and Node 20 via `nvm use`.
- `pnpm dev` boots Next with Turbopack; `pnpm dev:full` also runs Convex (`npx convex dev`) for full-stack testing.
- `pnpm build` then `pnpm start` for production preview; `pnpm bundle-analysis` with `ANALYZE=true` inspects bundle health.
- Guardrails: `pnpm lint`, `pnpm lint:fix`, `pnpm type-check`, `pnpm size`, `pnpm ts-prune`, `pnpm unimported`, `pnpm quality` (cache + dependency audit).
- Tests: `pnpm test`, `pnpm test:unit`, `pnpm test:integration`, `pnpm test:watch`, `pnpm test:coverage`.

## Coding Style & Naming Conventions

- Stack: TypeScript + React 19 + Next 15; design deep modules that hide implementation and expose intention.
- Prettier (`pnpm format`) enforces 2-space indent, double quotes, trailing commas, and Tailwind class sorting via `prettier-plugin-tailwindcss`.
- ESLint (`next lint`) covers a11y, hooks, Convex-specific rules; resolve all warnings before PR.
- Components use PascalCase (`GameControls.tsx`), hooks camelCase with `use` prefix, tests adopt feature-based `.test.tsx` suffixes; avoid grab-bag `Util` files—co-locate helpers within domain folders.

## Testing Guidelines

- Vitest handles unit + integration; shared setup in `src/test/setup.ts` configures React Testing Library and jest-dom.
- Favor behavior assertions over snapshots; mirror actual game flows when adding scenarios.
- Add or update siblings in `__tests__` when modifying components/hooks (`GuessInput.smoke.test.tsx` pattern).
- Require green runs for `pnpm test:unit` + `pnpm test:integration`; execute `pnpm test:coverage` when touching critical logic.

## Commit & Pull Request Guidelines

- Follow Conventional Commits (`feat:`, `fix:`, `refactor:`) as seen in history; keep subject imperative and ≤72 chars; one change per commit.
- Document test coverage or rationale in commit bodies; include schema or script impacts when relevant.
- PRs must link issues, summarize behavior shifts, attach UI diffs for visual work, and call out env/config changes.
- Before requesting review run lint, type-check, and the targeted test suites; note results in the PR description.

## Security & Configuration Tips

- Copy `.env.example` to `.env.local`; never commit secrets; document new variables inside the template.
- Convex + Clerk integration requires valid keys—use `pnpm verify:convex`, `pnpm verify:auth`, or `pnpm verify:auth:prod` before deployment.
- Run `pnpm pre-push` locally to catch schema drift, missing env vars, and type regressions prior to sharing branches.
