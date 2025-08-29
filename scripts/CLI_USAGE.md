# Chrondle Events CLI Management

## Quick Start

The events CLI tool allows you to manage historical events in your Chrondle database.

```bash
# Verify all functions are deployed
pnpm events verify

# Show all available commands
pnpm events --help
```

## Common Commands

### Viewing Events

```bash
# List all years with event statistics
pnpm events list

# Show all events for a specific year
pnpm events show 1969

# Validate data integrity
pnpm events validate
```

### Managing Individual Events

```bash
# Add a single event
pnpm events add-one -y 1969 -e "Neil Armstrong walks on the moon"

# Update an event (use event number from 'show' command)
pnpm events update-one -y 1969 -n 3 -t "Updated event text"

# Delete an event
pnpm events delete-one -y 1969 -n 7
```

### Managing Year Events (Batch)

```bash
# Add 6 events for a year (required for puzzles)
pnpm events add -y 1969 -e "Event 1" "Event 2" "Event 3" "Event 4" "Event 5" "Event 6"

# Update all events for a year (only if not used in puzzles)
pnpm events update -y 1969 -e "New Event 1" "New Event 2" "New Event 3" "New Event 4" "New Event 5" "New Event 6"
```

## Important Notes

- **Production Safety**: Events used in published puzzles cannot be modified or deleted
- **Duplicate Prevention**: The system prevents adding duplicate events for the same year
- **Deployment Required**: After updating `convex/events.ts`, run `npx convex deploy` to push changes to production
- **Event Count**: Each year needs exactly 6 events to be used for puzzle generation

## Troubleshooting

If you encounter errors:

1. **"Could not find function" error**: Run `npx convex deploy` to deploy latest functions
2. **"Event already exists" error**: Check for duplicates with `pnpm events show <year>`
3. **"Used in puzzle" error**: Events in published puzzles are protected from changes
4. **Verify deployment**: Run `pnpm events verify` to check all functions are deployed

## Database Statistics

Check current database status:

```bash
# Get overall statistics
pnpm events list

# Example output:
# Year  | Total | Used | Available
# ------|-------|------|----------
# 1969  | 6     | 0    | 6         ← Green: Ready for puzzles
# 1935  | 11    | 0    | 11        ← Green: Has extra events
# 2001  | 3     | 0    | 3         ← Yellow: Not enough for puzzle
```

## Environment Configuration

The CLI reads from `.env.local`:

- `NEXT_PUBLIC_CONVEX_URL`: Your Convex deployment URL
- Currently configured for production: `fleet-goldfish-183`
