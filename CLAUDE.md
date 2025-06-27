# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrondle is a daily historical guessing game built with Next.js 15, React 19, and TypeScript. Players guess the year of historical events based on progressive hints, similar to Wordle but for historical knowledge.

## Essential Commands

**IMPORTANT: This project uses pnpm exclusively. npm is blocked via preinstall script.**

### Development

```bash
pnpm dev                       # Start development server with Turbopack
pnpm build                     # Build for production
pnpm start                     # Start production server
```

### Code Quality

```bash
pnpm lint                      # Run ESLint
pnpm lint:fix                  # Fix ESLint issues automatically
pnpm type-check                # Run TypeScript type checking
pnpm format                    # Format code with Prettier
pnpm format:check              # Check code formatting
```

### Testing

```bash
pnpm test                      # Run tests with Vitest
pnpm test:watch                # Run tests in watch mode
pnpm test:coverage             # Run tests with coverage report
```

### Puzzle Management

```bash
pnpm validate-puzzles          # Validate puzzle data integrity
pnpm test-puzzles              # Test puzzle system functionality
pnpm test-debug                # Test debug year functionality
pnpm validate-curated-years    # Validate curated year data
```

## Architecture Overview

### Technology Stack

- **Framework**: Next.js 15 with App Router (`src/app/`)
- **UI**: React 19 with TypeScript, Tailwind CSS 4
- **Components**: Radix UI primitives + custom components (shadcn/ui pattern)
- **Testing**: Vitest with jsdom, React Testing Library
- **State**: Custom hooks with React's built-in state management
- **Styling**: CSS-in-JS via CSS variables + Tailwind utilities

### Key Directory Structure

```
src/
├── app/                     # Next.js App Router (layout, page, globals)
├── components/              # React components
│   ├── ui/                 # Reusable UI primitives (shadcn/ui style)
│   ├── modals/             # Game modals (Help, Settings, Stats, etc.)
│   └── magicui/            # Animation components
├── hooks/                   # Custom React hooks for state management
├── lib/                     # Core business logic and utilities
├── data/                    # Static game data (puzzles.json)
└── test/                   # Test configuration
```

### Core Architecture Patterns

**State Management via Custom Hooks:**

- `useGameState`: Main game state and actions
- `useStreak`: Win/loss streaks and achievements
- `useEnhancedTheme`: Theme management
- `useSwipeNavigation`: Touch gesture handling
- `useNotifications`: Push notification management

**Component Design:**

- Compound composition pattern for complex UI
- Accessibility-first with ARIA labels and screen reader support
- Mobile-first responsive design
- Props drilling avoided via custom hooks

**Data Architecture:**

- Static puzzle database in `puzzles.json` (100 curated historical events)
- Daily puzzle selection using deterministic date-based algorithm
- 6 progressive hints per puzzle, sorted by difficulty
- LocalStorage for daily progress with cleanup

### Key Business Logic Files

| File                          | Purpose                                               |
| ----------------------------- | ----------------------------------------------------- |
| `src/lib/gameState.ts`        | Core game state management and daily puzzle selection |
| `src/lib/puzzleData.ts`       | Static puzzle database access and curation            |
| `src/lib/constants.ts`        | All configuration constants and validation rules      |
| `src/lib/enhancedFeedback.ts` | Progressive hint feedback system                      |
| `src/hooks/useGameState.ts`   | Main game state hook with derived state               |

### Development Features

**Debug Mode:**

- Add `?debug=true&year=1969` to URL for specific year testing
- Bypasses persistence and daily puzzle selection
- Enables debug banner and additional logging

**Code Quality:**

- Husky + lint-staged for pre-commit hooks
- ESLint with Next.js and TypeScript rules
- Prettier for consistent formatting
- TypeScript with strict mode enabled

### Testing Strategy

- Vitest for unit testing with jsdom environment
- React Testing Library for component testing
- Test files co-located in `__tests__` directories
- Setup file: `src/test/setup.ts`

### Styling System

- Comprehensive CSS variables in `src/app/globals.css`
- Dark/light theme support via CSS custom properties
- Tailwind configuration extends base colors to CSS variables
- Component styling via `class-variance-authority`

## Development Guidelines

### Component Development

- Follow shadcn/ui patterns for new UI components
- Use CSS variables from design system rather than arbitrary values
- Always use provided hooks rather than direct state manipulation
- Co-locate tests with components

### Code Conventions

- TypeScript strict mode - handle all type errors
- Use absolute imports via `@/` path mapping
- Prefer composition over inheritance for components
- Memoize expensive calculations and derived state

### Running Tests

Run all quality checks before commits:

```bash
pnpm lint && pnpm type-check && pnpm test
```

### Puzzle Data

- Puzzles are curated historical events with 6 progressive hints
- Validation scripts ensure data integrity
- Never modify `puzzles.json` without running validation scripts
