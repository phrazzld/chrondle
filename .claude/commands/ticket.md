# Strategic Task Decomposition - Multi-Expert TODO Generation for Chrondle

Transform high-level plans into discrete, actionable TODO.md items using legendary programmer perspectives tailored for historical guessing game development.

**Usage**: `/project:ticket`

## GOAL

Synthesize implementation plans into a TODO.md file composed of discrete, well-defined, narrowly scoped, highly detailed, context-rich, atomic and actionable task items optimized for Chrondle's Next.js 15 + React 19 + TypeScript architecture and daily puzzle game mechanics.

## ANALYZE

Transform the current plan or requirements into the most effective task breakdown possible for Chrondle's historical guessing game development.

### Phase 1: Chrondle Context Analysis

1. **Read Planning Documents**

   - Read any existing plans, TASK.md, or requirements documentation
   - Understand how tasks relate to daily puzzle mechanics and user experience
   - Consider impact on game state management and hint progression systems

2. **Architecture & Technical Constraints**

   - Review Chrondle's Next.js 15 App Router patterns and React 19 hooks architecture
   - Understand custom state management via `useGameState`, `useStreak`, `useEnhancedTheme`
   - Consider localStorage persistence patterns and cross-browser compatibility
   - Analyze shadcn/ui component patterns and Tailwind CSS 4 integration

3. **Game Development Context**

   - Identify dependencies with puzzle data structure and hint algorithms
   - Consider mobile-first responsive design requirements
   - Review accessibility standards for diverse user base
   - Understand daily puzzle continuity and user retention factors

4. **Quality Standards**
   - Review leyline documents in `./docs/leyline/` for development principles
   - Consider pnpm-based workflow and pre-commit hooks integration
   - Analyze Vitest + React Testing Library testing patterns
   - Review existing `todo.md` patterns for task formatting consistency

### Phase 2: Multi-Expert Game Development Task Decomposition

Launch parallel subagents embodying legendary programmer perspectives using the Task tool. Each subagent must run independently and in parallel for maximum efficiency. CRITICAL: All subagents operate in research/investigation mode only - they should NOT modify code, use plan mode, or create files. They must output all thoughts, findings, and brainstorming directly to chat:

**Task 1: John Carmack - Game Engineering Excellence**

- Prompt: "As John Carmack, break down this Chrondle plan into atomic game engineering tasks. Focus on performance optimization for daily puzzle mechanics, efficient state management for hint progression, algorithmic clarity in historical data processing, and first principles thinking for game logic. Each task should be technically precise and optimized for React 19 rendering cycles. What are the most fundamental units of work for this historical guessing game? IMPORTANT: You are in research mode only - do not modify any code, do not use plan mode, and output all your task breakdown directly to chat."

**Task 2: David Allen - GTD for Game Development**

- Prompt: "As David Allen (Getting Things Done), decompose this Chrondle plan into next actions that are concrete, actionable, and context-specific for game development. Each task should have a clear 'done' state and be executable without further planning. Focus on removing ambiguity from game feature implementation, user experience polish, and daily puzzle workflow. Consider mobile testing contexts and cross-browser validation. IMPORTANT: You are in research mode only - do not modify any code, do not use plan mode, and output all your task breakdown directly to chat."

**Task 3: Kent Beck - Test-Driven Game Development**

- Prompt: "As Kent Beck, break down this Chrondle plan into testable increments specific to game mechanics. Each task should represent a verifiable behavior change in the historical guessing game. Structure tasks to enable test-first development of puzzle logic, hint systems, streak tracking, and user interactions using Vitest and React Testing Library. Consider game state edge cases and daily puzzle transitions. IMPORTANT: You are in research mode only - do not modify any code, do not use plan mode, and output all your task breakdown directly to chat."

**Task 4: Martin Fowler - Game Architecture & Refactoring**

- Prompt: "As Martin Fowler, identify refactoring and architectural tasks for Chrondle's React 19 + Next.js 15 codebase. Break down work to maintain clean game architecture, enable incremental improvements to puzzle systems, and prevent technical debt in custom hooks and component composition. Consider separation of game logic from UI components. IMPORTANT: You are in research mode only - do not modify any code, do not use plan mode, and output all your task breakdown directly to chat."

**Task 5: Joel Spolsky - Pragmatic Game Product Development**

- Prompt: "As Joel Spolsky, create Chrondle tasks that balance engineering excellence with shipping a compelling daily puzzle game. Include tasks for user experience polish, edge case handling (failed puzzles, state recovery), mobile-first responsive design, accessibility improvements, and practical deployment considerations. Focus on what makes users return daily. IMPORTANT: You are in research mode only - do not modify any code, do not use plan mode, and output all your task breakdown directly to chat."

### Phase 3: Chrondle-Specific Task Characteristics

Each expert should ensure their tasks are:

- **Atomic**: Cannot be meaningfully subdivided (ideal: 1-4 hours of work)
- **Actionable**: Clear implementation path with specific file references
- **Measurable**: Obvious completion criteria with testable outcomes
- **Game-Aware**: Consider impact on daily puzzle experience and user engagement
- **Mobile-First**: Account for touch interfaces and responsive design
- **Accessible**: Include ARIA considerations and screen reader compatibility
- **Performance-Conscious**: Consider bundle size and rendering efficiency
- **Test-Driven**: Include corresponding test cases where applicable

## EXECUTE

1. **Gather Chrondle Context**

   - Read all relevant planning documents and game requirements
   - Map out technical implementation landscape within existing architecture
   - Identify key milestones affecting daily puzzle continuity
   - Consider integration points with existing game state and UI components

2. **Launch Expert Subagents**

   - Use the Task tool to create independent subagents for each perspective
   - All subagents run in parallel for maximum efficiency
   - Each expert creates their task breakdown independently in research mode only
   - Focus on game development, React patterns, and user experience optimization
   - Collect all task lists with game-specific rationales via direct chat output

3. **Synthesis Round**

   - Launch a synthesis subagent using the Task tool to merge all expert task lists
   - Synthesis agent operates in research mode only - no code changes, no plan mode, output to chat
   - Eliminate duplicates while preserving game-specific insights
   - Order tasks by dependencies and critical path for daily puzzle functionality
   - Ensure comprehensive coverage without gaps in game experience

4. **Chrondle Task Formatting**

   - Format each task as: `- [ ] [Context] Specific action: implementation details with file references`
   - Include acceptance criteria focused on game behavior and user experience
   - Group related tasks under clear headings relevant to game features
   - Add priority indicators based on user impact and technical dependencies
   - Reference specific Chrondle patterns: hooks, components, styling approaches

5. **Generate TODO.md for Chrondle**
   Create a comprehensive TODO.md file with game-focused structure:

   ```markdown
   # TODO

   ## Overview

   [Brief summary of the implementation plan and game impact]

   ## Critical Path - Game Continuity

   [Tasks that could block daily puzzle functionality]

   ## Core Game Implementation

   - [ ] [GameLogic] Task with specific file refs (src/lib/gameState.ts)
   - [ ] [Components] Task with component patterns (src/components/ui/)
   - [ ] [Hooks] Task with state management (src/hooks/useGameState.ts)

   ## User Experience & Accessibility

   - [ ] [Mobile] Touch interface and responsive design tasks
   - [ ] [A11y] Screen reader and keyboard navigation improvements
   - [ ] [Performance] Bundle optimization and rendering efficiency

   ## Testing & Validation

   - [ ] [Unit] Game logic tests with Vitest
   - [ ] [Integration] Component tests with React Testing Library
   - [ ] [E2E] Daily puzzle flow validation

   ## Documentation & Polish

   - [ ] [UX] User-facing improvements and animations
   - [ ] [DevEx] Developer experience and maintainability

   ## Technical Debt & Architecture

   - [ ] [Refactor] Code quality improvements
   - [ ] [Arch] Architectural enhancements for scalability
   ```

6. **PR Scope Sanity Check for Game Development**
   After generating the initial TODO.md:

   - Analyze total scope considering game feature complexity
   - Estimate if completing all tasks would create a PR that is:
     - Too large (>500 lines or major game mechanic changes)
     - Too broad (touching multiple game systems or UI/logic boundaries)
     - Too risky for daily puzzle continuity (mixing game logic with UI changes)

   Game-specific scope considerations:

   - Keep puzzle logic changes separate from UI improvements
   - Isolate performance optimizations from new feature work
   - Separate accessibility improvements from core game mechanics
   - Consider mobile testing requirements for UI changes

7. **Scope Management with BACKLOG.md Integration**
   If breaking up is needed:

   - Prioritize game continuity and user experience tasks first
   - Take the highest priority, most cohesive chunk as new TODO.md scope
   - Regenerate TODO.md with only tasks for this focused scope
   - Write remaining chunks to BACKLOG.md using established format:

   ```markdown
   # BACKLOG

   ## High Priority

   - [ ] [HIGH] [FEATURE] Next game feature chunk with clear scope

   ## Medium Priority

   - [ ] [MED] [REFACTOR] Architecture improvements for scalability

   ## Low Priority

   - [ ] [LOW] [CHORE] Developer experience enhancements

   ## Ideas & Future Considerations

   - [ ] [IDEA] [FEATURE] Advanced game mechanics for future consideration

   ## Upcoming Work Chunks

   ### [Chunk Name] - Game Feature Enhancement

   **Prerequisites**: Core game logic must be stable
   **Scope**: What this chunk accomplishes for user experience
   **Game Impact**: How this affects daily puzzle engagement
   **Tasks**:

   - [ ] [Context] High-level task items for this chunk
   ```

## Success Criteria for Chrondle

- Every task is immediately actionable by a game developer without clarification
- Complete task list covers all aspects of the plan without breaking game continuity
- Tasks are properly sequenced with dependencies clear for daily puzzle functionality
- Each task includes sufficient context for implementation within Chrondle's architecture
- The breakdown enables parallel work on game logic, UI, and testing where possible
- No critical steps are missing from the game development implementation path
- TODO.md scope is appropriate for a single, reviewable PR that doesn't risk daily puzzles
- Larger work is properly organized in BACKLOG.md for future game enhancements
- Tasks consider mobile-first design and accessibility requirements
- Performance impact on daily puzzle experience is carefully considered

Execute this comprehensive task decomposition process now, optimized for Chrondle's historical guessing game development workflow.
