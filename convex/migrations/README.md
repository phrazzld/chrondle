# Chrondle Events and Puzzle System

This directory contains information about how Chrondle's puzzle system works.

## How Puzzles Work in Chrondle

**IMPORTANT: Puzzles are generated DYNAMICALLY from the events table**

The Convex database contains:

- **1,821 historical events** in the `events` table
- Events span from year -776 (First Olympic Games) to 2008
- Each event has a year and description

## Daily Puzzle Generation

The system generates puzzles dynamically each day:

1. A deterministic hash of the current date selects a year
2. All events from that year are retrieved from the `events` table
3. These events become the hints for that day's puzzle
4. The same date always produces the same puzzle globally

**There is NO migration needed** - the events table contains all necessary data.

## Database Structure

- **events table**: Contains 1,821 historical events
- **puzzles table**: Contains metadata for tracking (6 records)
- **plays table**: Tracks user attempts and completions
- **users table**: Stores user accounts

## Verification

To verify the events are present:

```bash
# Check event count
npx convex run events:count

# Check in Convex dashboard
npx convex dashboard
```

The system is working as designed - puzzles are generated on-demand from events.
