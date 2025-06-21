# Chrondle Gameplay Documentation

This document provides a comprehensive guide to Chrondle's game mechanics, hint system, and player experience design.

## 🎮 Core Game Loop

### Daily Puzzle Cycle
```
1. Player visits game → Load daily puzzle
2. Read initial historical event
3. Enter year guess
4. Receive feedback + new hint
5. Repeat until correct or 6 attempts
6. Share results → Wait for next day
```

### Game Session Flow
1. **Initialization**: Load or generate daily puzzle
2. **Progress Restoration**: Resume if already started today
3. **Gameplay**: Accept guesses and provide feedback
4. **Completion**: Show results and share options
5. **Persistence**: Save progress automatically

## 🏆 Winning Conditions

### Victory States
- **Guess 1/6**: Master historian! Perfect knowledge
- **Guess 2/6**: Excellent! Strong historical intuition  
- **Guess 3/6**: Good job! Solid reasoning
- **Guess 4/6**: Nice work! Used hints effectively
- **Guess 5/6**: Close call! Perseverance pays off
- **Guess 6/6**: Just made it! Never give up

### Failure State
- **X/6**: "So close!" - Show correct answer and all events

## 📅 Daily Puzzle System

### Deterministic Selection
All players worldwide get the same puzzle each day through deterministic year selection:

```javascript
// Simplified algorithm
const daysSinceEpoch = Math.floor((today - EPOCH_START) / (1000 * 60 * 60 * 24));
const yearIndex = daysSinceEpoch % CURATED_YEARS.length;
const selectedYear = CURATED_YEARS[yearIndex];
```

### Curated Year Collection
**50+ historically significant years** chosen for:
- **Event richness**: Likelihood of 6+ significant events
- **Historical importance**: Major turning points in history
- **Educational value**: Learning opportunities across eras
- **Global relevance**: Events of worldwide significance

#### Era Distribution
```
Ancient/Classical:  -776, -753, -221, -44
Medieval:          800, 1066, 1215, 1347, 1453
Renaissance:       1492, 1517, 1588, 1607, 1620
Revolution:        1776, 1789, 1804, 1815, 1848  
Industrial:        1865, 1876, 1885, 1893, 1903
Early 20th:        1914, 1917, 1918, 1929, 1936
WWII Era:          1939, 1941, 1945, 1947, 1948
Cold War:          1957, 1961, 1963, 1969, 1975
Late 20th:         1989, 1991, 1994, 1997, 1999
21st Century:      2001, 2003, 2008, 2011, 2016, 2020
```

### Midnight Reset
- **Local timezone**: Puzzle changes at player's midnight
- **Progress isolation**: Each day gets separate save slot
- **Consistency**: Same calculation method ensures global uniformity

## 🧩 Hint Progression System

### Progressive Difficulty Design
Events are strategically ordered from **most obscure to most recognizable** to create an optimal learning curve:

```
Hint 1 (Initial):     Most accessible event
Hint 2 (After guess): Most obscure event  
Hint 3 (After guess): Second most obscure
...
Hint 6 (Final):       Most famous/obvious event
```

### Event Recognizability Scoring

#### High-Recognition Keywords (10 points each)
```javascript
[
    // Space & Technology
    'moon', 'apollo', 'nasa', 'space', 'satellite',
    
    // Politics & Leadership  
    'president', 'king', 'queen', 'emperor', 'prime minister',
    
    // Conflict & Peace
    'war', 'peace', 'treaty', 'battle', 'revolution',
    
    // Major Events
    'independence', 'atomic', 'bomb', 'assassination',
    
    // Famous Figures
    'hitler', 'stalin', 'churchill', 'roosevelt', 'kennedy',
    'lincoln', 'washington', 'napoleon', 'caesar'
]
```

#### Medium-Recognition Keywords (5 points each)
```javascript
[
    // Actions & Events
    'battle', 'siege', 'died', 'born', 'elected', 'crowned',
    'signed', 'declared', 'defeated', 'conquered',
    
    // Exploration & Discovery
    'expedition', 'voyage', 'discovered', 'explored',
    
    // Construction & Creation
    'constructed', 'completed', 'built', 'founded',
    'established', 'created'
]
```

#### Length Modifiers
- **Short events** (< 50 chars): +5 points (concise = memorable)
- **Very short** (< 30 chars): +5 more points  
- **Long events** (> 100 chars): -5 points (verbose = obscure)

### Example Progression (1969)
```
Initial Hint:    "The Boeing 747 makes its first flight"
                 (Technical/specific - moderate recognition)

Guess 1 Wrong:   "The Internet precursor ARPANET is created"  
                 (Technical/obscure - low recognition)

Guess 2 Wrong:   "The Stonewall riots occur in New York"
                 (Cultural/specific - medium recognition)

Guess 3 Wrong:   "Richard Nixon becomes President"
                 (Political figure - high recognition)  

Guess 4 Wrong:   "Woodstock music festival takes place"
                 (Cultural icon - very high recognition)

Guess 5 Wrong:   "Apollo 11 lands on the Moon"
                 (Universally famous - maximum recognition)
```

## 🎯 Input & Validation

### Year Format Support
- **AD Years**: Positive integers (1, 1066, 1969, 2024)
- **BC Years**: Negative integers (-776, -753, -44)
- **No Year Zero**: Historically accurate (1 BC → 1 AD)

### Input Validation Rules
```javascript
const guess = parseInt(guessInput.value, 10);

// Invalid conditions
if (isNaN(guess)) return "Please enter a valid number";
if (guess === 0) return "Year 0 doesn't exist in history";
if (guess < -3000) return "Please enter a year after 3000 BC";
if (guess > currentYear) return "Please enter a year in the past";
```

### User Input Helpers
- **Placeholder text**: "Enter a year (e.g. 1969 AD or -776 for 776 BC)..."
- **Auto-focus**: Input field gets focus after each guess
- **Enter key**: Submits guess form
- **Clear on submit**: Input field cleared after valid guess

## 🧭 Feedback System

### Directional Indicators
Simple, clear guidance towards the correct year:

```javascript
const direction = guess < target ? '▲ LATER' : '▼ EARLIER';
```

#### Visual Design
- **Too Early**: Red background with up arrow "▲ LATER"
- **Too Late**: Blue background with down arrow "▼ EARLIER"  
- **Correct**: Green background "CORRECT!"

#### Colorblind Accessibility
```css
/* Alternative colors for colorblind users */
html.color-blind .bg-red-200 { background-color: #fde047; } /* Yellow */
html.color-blind .bg-blue-200 { background-color: #a5b4fc; } /* Indigo */
```

### Historical Context Hints
Each wrong guess reveals a new historical event from the same target year:

```
"Hint: [Historical event from target year]"
```

**Educational Benefits:**
- Learn multiple events from each year
- Understand historical context and connections
- Build knowledge even when guessing wrong

## 📊 Share System

### Results Format
Clean, readable format optimized for social sharing:

```
Chrondle - December 20, 2024
Target: 1969 AD - 3/6 ⭐

My guesses:
1. 1980 AD 🔽 Within 25 years!
2. 1960 AD 🔼 Within 10 years!
3. 1969 AD 🟩 CORRECT!

#Chrondle #HistoryGame
```

### Emoji Indicators
- **🟩**: Correct guess
- **🔼**: Too early (need later year)
- **🔽**: Too late (need earlier year)
- **⭐**: Victory star
- **💥**: Failed attempt

### Proximity Information
Results include proximity feedback for context:
- "CORRECT!"
- "Within 5 years!"
- "Within 10 years!"
- "Within 25 years!"
- etc.

## 🎨 User Experience Design

### Visual Feedback
- **Smooth animations**: Guess rows fade in with staggered timing
- **Color coding**: Consistent red/blue for early/late guesses
- **Typography hierarchy**: Clear distinction between years and hints
- **Responsive design**: Optimal experience on all screen sizes

### Accessibility Features
- **High contrast**: WCAG-compliant color combinations
- **Dark mode**: Automatic theme with manual toggle
- **Colorblind mode**: Alternative color scheme option
- **Keyboard navigation**: Full game playable without mouse
- **Screen reader support**: Semantic HTML and ARIA labels

### Progressive Disclosure
- **First visit**: Help modal explains rules
- **Settings discovery**: Accessible gear icon
- **Advanced features**: Dark mode, colorblind mode in settings
- **Share functionality**: Revealed only after game completion

## 📚 Educational Value

### Learning Objectives
1. **Historical Timeline**: Understanding chronological relationships
2. **Event Recognition**: Identifying significant historical moments
3. **Contextual Thinking**: Connecting events within time periods
4. **Research Skills**: Encouraging deeper historical exploration

### Knowledge Domains
- **Political History**: Elections, wars, treaties, revolutions
- **Technological Progress**: Inventions, discoveries, innovations  
- **Cultural Milestones**: Art, literature, social movements
- **Scientific Achievements**: Space exploration, medical breakthroughs
- **Geographic Events**: Explorations, territorial changes

### Difficulty Progression
- **Beginner-Friendly**: Clear directional hints
- **Skill Building**: Progressive hint system teaches pattern recognition
- **Expert Challenge**: Obscure events test deep historical knowledge
- **Continuous Learning**: Daily variety ensures ongoing education

## 🔄 Replay Value

### Daily Engagement
- **New puzzle daily**: Fresh challenge every 24 hours
- **Consistent timing**: Midnight reset creates anticipation
- **Social sharing**: Compare results with friends and community
- **Streak potential**: Motivation for daily return visits

### Long-Term Interest
- **50+ year cycle**: Takes 50+ days to see all curated years
- **Seasonal variety**: Different historical periods throughout year
- **Knowledge building**: Each puzzle adds to historical understanding
- **Community aspect**: Shared daily experience with all players

### Difficulty Adaptation
- **Self-balancing**: Hint system adapts to player knowledge
- **No punishment**: Wrong guesses provide educational value
- **Achievement feel**: Multiple ways to feel successful
- **Learning curve**: Gradual improvement in historical intuition

## 🎲 Game Balance

### Fairness Principles
- **Equal information**: All players get identical puzzles and hints
- **No time pressure**: Unlimited time for thoughtful consideration
- **No penalties**: Wrong guesses don't punish, they educate
- **Consistent rules**: Same mechanics apply to all years and players

### Difficulty Calibration
- **Curated years**: Hand-selected for appropriate challenge level
- **Event variety**: Mix of famous and obscure events in each year
- **Progressive hints**: Ensure solvability even for difficult years
- **Fallback system**: Guarantees playability even with API issues

### Accessibility Balance
- **Multiple skill levels**: Enjoyable for novices and experts
- **Cultural awareness**: Events chosen for global relevance
- **Language clarity**: Simple, clear event descriptions
- **Visual design**: Clean, uncluttered interface

---

*This gameplay design prioritizes education, accessibility, and engaging daily habit formation while maintaining historical accuracy and fairness.*