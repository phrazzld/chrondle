# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Chrondle**, a daily historical guessing game built with Next.js 15 and TypeScript. Players guess the year when historical events occurred, getting proximity feedback for their guesses. The project was migrated from a vanilla HTML/JavaScript implementation to a modern Next.js architecture.

## Commands

- **Development**: `npm run dev --turbopack` - Start development server with Turbo
- **Build**: `npm run build` - Create production build
- **Start**: `npm start` - Start production server  
- **Lint**: `npm run lint` - Run ESLint checks

## Architecture

### Core Game Logic
The game logic is organized into separate modules in `src/lib/`:

- **Game State** (`gameState.ts`): Core game mechanics, puzzle initialization, daily year selection from curated list, and localStorage management for progress persistence
- **API Integration** (`api.ts`): Historical events fetching from API Ninjas with Wikidata SPARQL fallback, event enhancement, and LLM hint generation
- **Constants** (`constants.ts`): All configuration values, API endpoints, scoring rules, and game parameters
- **Utilities** (`utils.ts`): Helper functions for year formatting, proximity feedback, sharing, countdown timers
- **Storage** (`storage.ts`): localStorage wrappers for settings and progress

### Data Flow
1. Daily puzzle initialization selects a curated year using deterministic hash
2. Historical events fetched from API Ninjas, with Wikidata SPARQL as fallback
3. Events sorted by recognizability (obscure to obvious) using keyword scoring
4. Game progress auto-saved to localStorage with puzzle validation
5. Theme and accessibility settings persisted across sessions

### Key Features
- **Daily Puzzles**: Deterministic year selection from curated historical years
- **Multi-API**: Primary API Ninjas with Wikidata SPARQL backup
- **Event Enhancement**: Context-aware descriptions using location/participant data
- **LLM Integration**: Optional OpenAI hint enhancement (user-provided API key)
- **Progressive Difficulty**: Events sorted from obscure to recognizable
- **Accessibility**: Dark mode and color-blind support via React Context

### Technology Stack
- **Framework**: Next.js 15 with App Router and Turbopack
- **Styling**: Tailwind CSS v4 with PostCSS
- **TypeScript**: Strict type checking enabled
- **State Management**: React Context for theme/settings
- **Storage**: Browser localStorage with validation and cleanup
- **APIs**: API Ninjas (historical events), Wikidata SPARQL (fallback), OpenAI (optional)

### Component Structure
- Theme management through React Context Provider
- Modular utility functions with TypeScript interfaces
- Separation of concerns between game logic, API integration, and UI

## Development Notes

### Debugging
The codebase includes extensive debug logging with `🔍 DEBUG:` prefixes. Debug mode can be enabled via URL parameters (`?debug=true&year=1969`).

### API Keys
- API Ninjas key is embedded (acceptable for this historical data API)
- OpenAI API key must be user-provided via localStorage for LLM features

### Storage Strategy
- Daily progress keyed by date with puzzle validation
- Automatic cleanup of old localStorage entries
- Settings persistence for theme preferences

### Event Processing
Events are enhanced using contextual data (location, participants) and scored for recognizability using keyword matching and length heuristics.