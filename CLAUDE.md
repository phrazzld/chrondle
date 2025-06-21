# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

Chrondle is a single-page web application built as a daily historical guessing game. The entire application is contained in one HTML file (`index.html`) with embedded CSS and JavaScript.

Key components:
- **Game Logic**: Manages puzzle state, guesses, and game progression
- **UI Components**: Modals for help/settings/game-over, guess input form, and history display
- **Data Source**: Wikimedia API for daily historical events with fallback puzzles
- **Persistence**: LocalStorage for settings, progress, and daily game state

## Game Mechanics

The game fetches historical events from the Wikimedia API for the current date, groups them by year, and selects a year with sufficient events (≥6) as the daily puzzle. Players have 6 attempts to guess the correct year, receiving directional hints and additional historical events from the target year after each guess.

## Development Notes

- This is a pure HTML/CSS/JavaScript application with no build process
- Uses Tailwind CSS via CDN for styling
- Game state is managed in a single `gameState` object
- Daily puzzles are deterministic based on the current date
- Includes accessibility features like color-blind mode and dark mode
- No server-side components or database required

## Testing

To test the application, simply open `index.html` in a web browser. The game will automatically fetch the daily puzzle and be ready to play.
