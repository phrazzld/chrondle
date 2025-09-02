# Chrondle Event Database Management Workflow

## 🚨 CRITICAL: Always Check Before Adding!

The #1 mistake is assuming a year is missing when it actually exists. This creates duplicates and wastes time.

### ⚠️ Golden Rule

**NEVER add a year without checking if it exists first!**

```bash
# WRONG ❌
pnpm events add -y 1776 -e "Event 1" "Event 2" "Event 3" "Event 4" "Event 5" "Event 6"
# Error: Year 1776 already exists with 8 events.

# RIGHT ✅
pnpm events show 1776  # Check first!
# If "Year not found" → Safe to add
# If events exist → Review quality instead
```

## 📋 Pre-Flight Checklist

### Step 1: Check What You're Working With

```bash
# Check specific years you think might be missing
pnpm events check-years 1492 1776 1865 1453 1620 1783

# Find all missing years in a historical period
pnpm events find-missing --from 1800 --to 1900

# Get overall database health report
pnpm events audit
```

### Step 2: Decision Tree

```
Is the year missing?
├─ YES → Add new year with 6 events
│        pnpm events add -y YEAR -e "..." (6 events)
│
└─ NO → Year exists
        │
        ├─ Has < 6 events? → Add more events
        │   pnpm events add-one -y YEAR -e "..."
        │
        ├─ Has vague events? → Fix them
        │   pnpm events show YEAR
        │   pnpm events update-one -y YEAR -n NUMBER -t "Better event"
        │
        ├─ Has duplicates? → Remove them
        │   pnpm events show YEAR
        │   pnpm events delete-one -y YEAR -n NUMBER
        │
        └─ Has < 10 events? → Add variety
            pnpm events add-one -y YEAR -e "..."
```

## 🎯 Prioritized Workflow

### Priority 1: Add Missing Years

```bash
# Find what's truly missing
pnpm events find-missing --from 1400 --to 2000

# Add a missing year (ONLY if confirmed missing!)
pnpm events add -y 1850 \
  -e "California becomes 31st state joining United States" \
  -e "Taiping Rebellion begins in Qing Dynasty China" \
  -e "Millard Fillmore becomes thirteenth President after Taylor dies" \
  -e "Compromise of 1850 attempts to settle slavery disputes" \
  -e "Louis Napoleon stages coup establishing Second French Empire" \
  -e "Telegraph cable laid under English Channel connecting Britain France"
```

### Priority 2: Fix Quality Issues

```bash
# Audit for quality problems
pnpm events audit

# Review a year with issues
pnpm events show 1776

# Fix vague events (add proper nouns!)
# BAD:  "A scientist makes a discovery"
# GOOD: "Marie Curie discovers radium"
pnpm events update-one -y 1776 -n 1 -t "Adam Weishaupt founds Illuminati in Bavaria"
```

### Priority 3: Expand Depleted Years

```bash
# Find depleted years
pnpm events audit  # Look for red/yellow years

# Add variety to depleted years
pnpm events add-one -y 1969 -e "Sesame Street premieres on PBS television"
```

## 📝 Event Quality Standards

Every event MUST:

- ✅ Use proper nouns (people, places, organizations)
- ✅ Be factually accurate and verifiable
- ✅ Be unique within its year
- ✅ Not reveal the year in the text
- ✅ Be ≤ 20 words, present tense

### Good Events

- "Neil Armstrong walks on the moon" ✅
- "Constantinople falls to Ottoman Empire" ✅
- "Marie Curie wins Nobel Prize in Physics" ✅

### Bad Events

- "A space achievement occurs" ❌ (vague, no proper nouns)
- "The Y2K bug causes panic" ❌ (reveals year 2000)
- "Scientists make important discovery" ❌ (no specifics)

## 🔍 Common Mistakes to Avoid

### Mistake 1: Not Checking First

```bash
# ALWAYS run this first:
pnpm events show 1492
# or
pnpm events check-years 1492 1776 1865
```

### Mistake 2: Ignoring Warnings

```bash
# This warning means the year ALREADY EXISTS:
"⚠️  Warning: Year 1776 already has 8 events"
# STOP and check instead of continuing!
```

### Mistake 3: Creating Duplicates

```bash
# Check for similar events before adding
pnpm events show 1492
# Look for events that might be worded differently but same fact
```

### Mistake 4: Vague Descriptions

```bash
# Always use proper nouns!
# ❌ "Explorer discovers new lands"
# ✅ "Christopher Columbus reaches San Salvador"
```

## 🛠️ Useful Command Reference

### Information Commands

```bash
pnpm events list              # See all years with color coding
pnpm events show 1969         # View all events for a year
pnpm events check-years 1492 1776  # Check if specific years exist
pnpm events find-missing      # Find gaps in coverage
pnpm events audit             # Quality and priority report
pnpm events validate          # Check data integrity
```

### Modification Commands

```bash
pnpm events add -y YEAR -e "..." (x6)     # Add new year
pnpm events add-one -y YEAR -e "..."      # Add single event
pnpm events update-one -y YEAR -n NUM -t "..."  # Fix an event
pnpm events delete-one -y YEAR -n NUM     # Remove duplicate
```

## 📊 Understanding Output Colors

- 🟢 **Green**: Ready for puzzles (6+ available events)
- 🟡 **Yellow**: Partially depleted (1-5 available)
- 🔴 **Red**: Fully depleted (0 available, all used)

## 🚀 Example Workflow Session

```bash
# 1. Start with audit to understand priorities
pnpm events audit

# 2. Check years I think might be missing
pnpm events check-years 1066 1215 1492 1776

# Output shows 1066 and 1215 are MISSING

# 3. Add truly missing year 1066
pnpm events add -y 1066 \
  -e "William the Conqueror defeats Harold at Battle of Hastings" \
  -e "Halley's Comet appears before Norman invasion of England" \
  -e "Westminster Abbey construction begins under Edward Confessor" \
  -e "Harald Hardrada dies at Battle of Stamford Bridge" \
  -e "Norman French becomes language of English aristocracy" \
  -e "Domesday Book survey commissioned to catalog English holdings"

# 4. Review existing year 1492 for quality
pnpm events show 1492
# Found vague event at position 2

# 5. Fix vague event
pnpm events update-one -y 1492 -n 2 -t "Martin Behaim creates first terrestrial globe"

# 6. Validate everything looks good
pnpm events validate
```

## ✨ Pro Tips

1. **Batch check years** before starting work:

   ```bash
   pnpm events check-years 1066 1215 1415 1492 1588 1666 1776
   ```

2. **Use audit regularly** to prioritize work:

   ```bash
   pnpm events audit | head -50
   ```

3. **Keep events diverse** - mix politics, science, culture, sports

4. **Verify with multiple sources** before adding events

5. **Run validation** after major changes:
   ```bash
   pnpm events validate
   ```

Remember: **Quality > Quantity**. Better to have well-crafted events with proper nouns than many vague ones!
