# Architecture Decisions

## Overview
This document captures the key technical decisions made during the Chrondle migration from static HTML to Next.js 15 + OpenRouter integration.

## 🏗️ Framework & Infrastructure Decisions

### Next.js 15 App Router vs. Alternatives
**Decision**: Next.js 15 with App Router
**Rationale**: 
- Server Actions enabled by default (no experimental config needed)
- Built-in TypeScript and Tailwind support
- Excellent SSR for SEO and performance
- Server Actions provide secure API integration without exposing keys
- Mature ecosystem with strong OpenRouter compatibility

**Alternatives Considered**:
- ❌ **Vercel Edge Functions**: More overhead, less integrated than Server Actions
- ❌ **Static Site + Client API**: Would expose API keys, worse UX
- ❌ **Next.js Pages Router**: App Router is the modern standard

### TypeScript Configuration  
**Decision**: Strict TypeScript with comprehensive type safety
**Rationale**:
- Prevents runtime errors from JavaScript to TypeScript migration
- Improves maintainability and refactoring safety
- Better IDE support and development experience
- Type safety for API responses and game state

### Tailwind CSS v4
**Decision**: Stick with Tailwind v4 (latest) as initialized
**Rationale**:
- Maintains exact visual compatibility with original
- All existing classes from ORIGINAL.html work without changes
- Better performance and developer experience than v3
- Built-in dark mode and color scheme support

## 🎨 UI & Styling Architecture

### Theme Management Strategy
**Decision**: React Context + localStorage with SSR compatibility
**Rationale**:
- Preserves exact behavior from ORIGINAL.html (`document.documentElement.classList`)
- SSR-safe with proper hydration handling
- Clean separation of concerns (theme logic separate from components)
- Prevents flash of unstyled content (FOUC)

**Implementation**: `src/components/theme-provider.tsx`
- Dark mode: `html.dark` class management
- Colorblind mode: `html.color-blind` class management  
- localStorage persistence with fallback for SSR

### CSS Architecture
**Decision**: Global CSS with component-specific classes
**Rationale**:
- Preserves all custom animations and transitions from ORIGINAL.html
- Maintains exact visual behavior (modal transitions, game animations)
- Easier migration path (copy CSS directly)
- Better performance than CSS-in-JS for this use case

**Files**:
- `src/app/globals.css`: All game-specific styles from ORIGINAL.html
- Component CSS: Handled through Tailwind classes in JSX

### Font Management
**Decision**: Next.js Font Optimization with Google Fonts
**Rationale**:
- Maintains exact typography from ORIGINAL.html (Inter + Playfair Display)
- Better performance than CDN fonts (preloading, swap strategies)
- Automatic font fallbacks and loading optimization
- CSS variable exposure for consistent usage

## 🧠 Game Logic Architecture

### Modular Extraction Strategy
**Decision**: Domain-driven module separation
**Rationale**:
- **`gameState.ts`**: Pure game logic and state management
- **`api.ts`**: External API integrations and data fetching
- **`utils.ts`**: Reusable utilities and helper functions  
- **`constants.ts`**: Configuration and static data
- **`storage.ts`**: localStorage abstraction with SSR safety

**Benefits**:
- Easier testing and maintainability
- Clear separation of concerns
- Reusable across different UI frameworks
- Better TypeScript inference and safety

### State Management Approach
**Decision**: React hooks + TypeScript interfaces, no external state management
**Rationale**:
- Game state is simple enough for local React state
- Avoids complexity of Redux/Zustand for this use case
- Maintains exact behavior from ORIGINAL.html JavaScript variables
- localStorage handles persistence, React handles UI state

### localStorage Preservation Strategy
**Decision**: 100% compatibility with SSR-safe wrapper
**Rationale**:
- Users shouldn't lose their settings/progress during migration
- All 8 localStorage patterns from ORIGINAL.html preserved exactly
- Added SSR compatibility for Next.js without changing behavior
- Comprehensive testing and verification (see LOCALSTORAGE_VERIFICATION.md)

**Implementation**: `src/lib/storage.ts`
- Safe storage operations with `typeof window !== 'undefined'` checks
- Graceful fallbacks for localStorage unavailability
- Exact function signatures matching ORIGINAL.html usage

## 🤖 LLM Integration Architecture

### OpenRouter vs. Direct Provider Integration
**Decision**: OpenRouter unified API
**Rationale**:
- **Cost**: Free tier with DeepSeek R1, Gemma, Llama models
- **Reliability**: Automatic failover between models
- **Simplicity**: Single API for multiple LLM providers
- **Flexibility**: Easy to switch models without code changes

**Cost Comparison (2025)**:
- DeepSeek R1: $0.55/$2.19 per 1M tokens (via OpenRouter free tier)
- Claude Haiku: $0.25/$1.25 per 1M tokens (more expensive)
- GPT-3.5-turbo: $0.50/$1.50 per 1M tokens (more expensive)

### Server Actions vs. Edge Functions
**Decision**: Next.js 15 Server Actions for LLM calls
**Rationale**:
- **Security**: API keys never exposed to client
- **Performance**: Server-side execution, no cold starts
- **Integration**: Built into Next.js 15, no additional deployment
- **Error Handling**: Better server-side error handling and logging

**Implementation Plan**:
- `src/app/actions/enhance-hint.ts`: Server action for hint enhancement
- Fallback chain: LLM → Enhanced → Cleaned → Raw label
- Rate limiting and caching built-in

### Model Selection Strategy
**Decision**: Ordered fallback array with cost optimization
**Rationale**:
- Primary: `deepseek/deepseek-r1:free` (free tier)
- Secondary: `google/gemma-3-27b-it:free` (free tier)  
- Tertiary: `openrouter/auto:floor` (cheapest paid)
- Final: Enhanced description fallback (no LLM)

## 🔧 Development & Deployment Decisions

### Project Structure
**Decision**: `src/` directory with clear separation
```
src/
├── app/          # Next.js App Router pages and layouts
├── lib/          # Game logic, utilities, API integrations  
├── components/   # Reusable React components
└── actions/      # Server Actions for LLM integration
```

**Rationale**:
- Clear separation between framework code and business logic
- Easier testing and maintenance
- Better import organization with `@/` alias
- Follows Next.js 15 best practices

### Environment Configuration
**Decision**: `.env.local` for local development, environment variables for production
**Required Variables**:
- `OPENROUTER_API_KEY`: OpenRouter API key for LLM integration
- `SITE_URL`: Base URL for OpenRouter API headers

### Error Handling Philosophy
**Decision**: Graceful degradation with comprehensive fallbacks
**Rationale**:
- LLM failures should never break core gameplay
- Network issues should fall back to cached/static content
- User should never see technical error messages
- Debug information available in development mode

**Implementation**:
- Try-catch blocks around all API calls
- Fallback chain for hint generation
- User-friendly error states
- Comprehensive logging for debugging

## 🎯 Migration Philosophy

### Preservation vs. Enhancement
**Decision**: Preserve first, enhance second
**Rationale**:
- User experience should be identical initially
- New features (LLM hints) are additive enhancements
- Risk mitigation: working migration before optimization
- Easier rollback if issues arise

### Testing Strategy
**Decision**: Integration testing with real API verification
**Rationale**:
- Critical path: `?debug=true&year=1401` must work identically
- localStorage compatibility must be verified completely
- LLM integration must gracefully handle all failure modes
- Performance must match or exceed original HTML

### Deployment Strategy  
**Decision**: Vercel deployment with OpenRouter integration
**Rationale**:
- Next.js 15 optimized for Vercel
- Server Actions work seamlessly  
- Environment variable management
- Easy rollback and preview deployments

## 🔍 Quality Assurance Decisions

### Verification Requirements
**Decision**: Comprehensive verification documents for complex migrations
**Files**:
- `LOCALSTORAGE_VERIFICATION.md`: Line-by-line localStorage compatibility proof
- `MIGRATION_STATUS.md`: Current progress and completion verification
- `TODO.md`: Updated task tracking with success criteria

**Rationale**:
- Complex migrations require proof of compatibility
- Documentation enables handoff between engineers
- Verification prevents regression bugs
- Clear success criteria for each phase

---

## 📚 References & Context

- **Original Implementation**: `ORIGINAL.html` - Complete reference implementation
- **OpenRouter Documentation**: Used Context7 for API integration patterns
- **Next.js 15 Documentation**: Server Actions, App Router, font optimization
- **Migration Conversation**: Full context captured in this directory's documentation

---

*These decisions were made to ensure a successful migration that preserves user experience while adding modern capabilities. All decisions prioritize reliability and maintainability over premature optimization.*