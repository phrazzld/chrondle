# Chrondle - The Daily History Game

**Guess the year of historical events in 6 tries or less!**

Chrondle is a Wordle-inspired game where players guess the year when significant historical events occurred. Each day features a new puzzle with events from the same target year, and all players worldwide get the same puzzle.

## 🎯 How to Play

1. **Read the historical event** displayed at the top
2. **Enter a year** (including BC years like -776 for 776 BC)
3. **Get feedback** with directional hints and new historical events
4. **Refine your guesses** using the clues provided
5. **Win** by guessing the correct year in 6 attempts or less!

### Example Gameplay
```
Event: "The Boeing 747 makes its first flight"
Your guess: 1975 AD
Feedback: ▼ EARLIER
New hint: "The Internet precursor ARPANET is created"

Your guess: 1968 AD  
Feedback: ▲ LATER
New hint: "The Stonewall riots occur in New York"

Your guess: 1969 AD
Result: 🟩 CORRECT!
```

## ✨ Features

### Core Gameplay
- **Daily puzzles** that reset at midnight local time
- **Historical accuracy** powered by API Ninjas Historical Events API
- **BC/AD year support** for ancient to modern history
- **Progressive hints** that get easier with each wrong guess
- **Smart event sorting** from obscure to well-known

### User Experience
- **Responsive design** that works on all devices
- **Dark mode** and **colorblind-friendly mode**
- **Share functionality** to compare results with friends
- **Progress saving** automatically resumes your daily game
- **Accessibility features** with proper contrast and keyboard navigation

### Technical Excellence
- **Single-file architecture** - no build process required
- **Offline-ready fallbacks** with hardcoded events
- **Client-side caching** to minimize API calls
- **Rate limiting** to respect API quotas
- **Deterministic daily puzzles** ensure all players get the same challenge

## 🚀 Quick Start

### For Players
1. Open `index.html` in any modern web browser
2. Start guessing! No installation required.

### For Developers
1. Clone the repository
2. Open `index.html` in your browser or serve it locally
3. All game logic is contained in the single HTML file

```bash
# Simple local server (optional)
python -m http.server 8000
# or
npx serve .
```

## 🔧 Configuration

The game uses these configurable elements:

- **API Key**: Located in the `API_NINJAS_KEY` constant
- **Curated Years**: 50+ historically significant years in `CURATED_YEARS` array
- **Fallback Events**: Hardcoded 1969 events for when API fails
- **Max Guesses**: 6 attempts (configurable in `gameState.maxGuesses`)

## 🌟 Game Design Philosophy

Chrondle follows the **"Make it work, make it fast, make it pretty"** philosophy:

1. **Working software first** - Robust fallbacks ensure the game always works
2. **Performance** - Minimal dependencies, fast loading, efficient caching
3. **Polish** - Beautiful UI, smooth animations, delightful interactions

### Event Progression System
Events are sorted by recognizability to create a satisfying difficulty curve:
- **First hint**: Most obscure event (e.g., technical specifications)
- **Later hints**: Increasingly famous events (e.g., cultural milestones)
- **Final hints**: Universally known events (e.g., Moon landing, major wars)

## 🛠 Technical Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Styling**: Tailwind CSS (via CDN)
- **Fonts**: Inter + Playfair Display (Google Fonts)
- **API**: API Ninjas Historical Events
- **Storage**: LocalStorage for settings and progress

## 🎨 Customization

### Adding New Years
Edit the `CURATED_YEARS` array to include additional historically significant years:

```javascript
const CURATED_YEARS = [
    -776, -753, -221, -44,  // BC years
    1066, 1215, 1347, 1453, // Medieval
    1492, 1517, 1588, 1607, // Renaissance
    // ... add more years
];
```

### Modifying Event Scoring
The `scoreEventRecognizability()` function determines hint progression. Adjust the keyword lists to change difficulty:

```javascript
const highRecognitionTerms = [
    'moon', 'apollo', 'president', 'war', 'peace'
    // Add more recognizable terms
];
```

## 🔒 Privacy & Security

- **API Key Exposure**: The API key is intentionally exposed in client-side code for this prototype
- **Rate Limiting**: Built-in request throttling (1 second between calls)
- **No Tracking**: No analytics, cookies, or user data collection
- **Local Storage**: Only stores game progress and preferences locally

## 🌍 Browser Compatibility

Chrondle works on:
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b my-feature`
3. **Test** your changes thoroughly
4. **Commit** with descriptive messages following [Conventional Commits](https://conventionalcommits.org/)
5. **Submit** a pull request

### Development Guidelines
- Maintain the single-file architecture
- Test across multiple browsers and devices
- Ensure accessibility compliance
- Follow existing code style and patterns
- Add appropriate error handling

## 📊 Performance Metrics

- **Load Time**: < 2 seconds on 3G
- **Bundle Size**: ~15KB (single HTML file)
- **API Calls**: Max 2 per day per user
- **Memory Usage**: < 5MB
- **Lighthouse Score**: 90+ across all categories

## 🐛 Known Issues

- **Year 0 Limitation**: Historical calendars don't include year 0 (goes from 1 BC to 1 AD)
- **API Dependency**: Some years may have insufficient events from the API
- **Timezone Edge Cases**: Daily reset based on user's local timezone

## 📈 Future Enhancements

- [ ] **Streak Tracking**: Track consecutive daily wins
- [ ] **Difficulty Modes**: Easy (1900-2000), Medium (1500-2000), Hard (all years)
- [ ] **Archive Mode**: Play previous puzzles
- [ ] **Keyboard Shortcuts**: Enter to submit, number keys for input
- [ ] **PWA Support**: Installable app with offline functionality
- [ ] **Statistics Dashboard**: Win rate, average guesses, time played
- [ ] **Social Features**: Friend leaderboards, direct challenges

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Credits

- **Historical Data**: [API Ninjas](https://api.api-ninjas.com/)
- **UI Framework**: [Tailwind CSS](https://tailwindcss.com/)
- **Fonts**: [Google Fonts](https://fonts.google.com/)
- **Inspiration**: [Wordle](https://www.nytimes.com/games/wordle/) by Josh Wardle
- **Philosophy**: John Carmack's engineering principles

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/chrondle/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/chrondle/discussions)
- **Email**: your-email@example.com

---

*Made with ❤️ for history enthusiasts and puzzle lovers worldwide.*