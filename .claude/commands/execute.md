# Strategic Task Executor - Systematic TODO Completion

Methodically execute tasks from TODO.md with expert-level strategic planning and implementation.

**Usage**: `/project:execute`

## GOAL

Select and complete the next available task from TODO.md using comprehensive analysis, strategic planning, and flawless execution for the Chrondle historical guessing game.

## ACQUISITION

Select the next available ticket from TODO.md following this priority:
1. In-progress tasks marked with `[~]` - Continue where work was paused
2. Unblocked tasks marked with `[ ]` - Start fresh work
3. Consider task dependencies and critical path
4. Skip blocked tasks until dependencies are resolved

If all tasks in TODO.md are completed:
- Celebrate completion appropriately
- Suggest next strategic moves for application improvement
- Halt

## CONTEXT GATHERING

Conduct comprehensive review before execution:

### 1. **Chrondle Codebase Analysis**
- Read all files mentioned in or relevant to the task
- Study `src/lib/` modules for game logic patterns
- Understand existing game state management and API integration
- Identify potential impact areas and dependencies
- Review localStorage compatibility requirements

### 2. **Next.js & React Architecture**
- Review App Router patterns and component structure
- Understand React hooks usage for game state
- Check Tailwind CSS configuration and theming
- Verify TypeScript integration and type safety

### 3. **External Research**
- Use web searches for Next.js 15 best practices
- Research historical API documentation and game mechanics
- Look up React patterns for interactive applications
- Study server actions and modern web development practices
- Use the Context7 MCP server to study relevant documentation

## STRATEGIC PLANNING

### Multi-Expert Planning Session

For complex tasks, use the Task tool to consult expert perspectives:

**Task 1: John Carmack - Engineering Excellence**
- Prompt: "As John Carmack, analyze this implementation task. What's the most elegant, performant solution? Consider algorithmic efficiency, system design, and mathematical elegance. What would you optimize for a historical guessing game?"

**Task 2: Dan Abramov - React Best Practices**
- Prompt: "As Dan Abramov, review this React implementation task. What's the most idiomatic React approach? Focus on proper hook usage, component composition, state management patterns, and avoiding common pitfalls."

**Task 3: Kent Beck - Test-Driven Development**
- Prompt: "As Kent Beck, plan this implementation. How would you approach it test-first? What's the smallest change that could possibly work? How do we ensure correctness for a game application?"

### Plan Synthesis
- Combine expert insights into a cohesive strategy
- Create step-by-step implementation plan
- Identify checkpoints for validation
- Plan for rollback if issues arise

## IMPLEMENTATION

Execute the approved plan with precision:

### 1. **Pre-Implementation Setup**
- Check existing codebase structure and dependencies
- Review current game logic modules for compatibility
- Set up any necessary configuration files
- Prepare any required imports or utilities

### 2. **Incremental Execution**
- Implement in small, testable increments
- Run `npm run lint` after significant changes
- Run `npm run build` to catch TypeScript errors
- Follow project's code style and conventions
- Commit working states frequently

### 3. **Continuous Validation**
- Run linters and type checking: `npm run lint`
- Execute build process: `npm run build`
- Use curl to test API endpoints if applicable
- Verify no TypeScript compilation errors
- Check for React/Next.js warnings in build output

### 4. **Adaptive Response**
If encountering unexpected situations:
- **HALT** implementation immediately
- Document the specific issue encountered
- Analyze implications for the current approach
- Present findings to user with recommendations
- Request user to run dev server for testing if needed

## QUALITY ASSURANCE

Before marking task complete:

### 1. **Build & Lint Validation**
- TypeScript compilation succeeds: `npm run build`
- Linting passes: `npm run lint`
- No build errors or warnings
- All imports resolve correctly
- Type safety maintained

### 2. **Code Quality Checks**
- Implementation follows established patterns
- Proper error handling included
- No console.log statements left in production code
- Clean, readable, maintainable code
- Appropriate comments for complex logic

### 3. **Integration Verification**
- Changes work with existing codebase structure
- No breaking changes to public APIs
- TypeScript interfaces maintained
- Component contracts preserved
- Build process remains functional

## CLEANUP

Upon successful completion:

### 1. **Task Management**
- Update task status to `[x]` in TODO.md
- Add completion notes if helpful for future reference
- Check for any follow-up tasks that are now unblocked

### 2. **Code Finalization**
- Ensure all changes committed with clear messages
- Remove any debugging code or temporary files
- Update documentation if APIs changed
- Clean up unused imports

### 3. **Progress Assessment**
- Review remaining tasks in TODO.md
- Consider if new tasks emerged from implementation
- Identify any technical debt or improvement opportunities
- Prepare summary of what was accomplished

## SUCCESS CRITERIA

- Task completed according to specifications
- Build succeeds without errors: `npm run build`
- Linting passes: `npm run lint`
- Code quality meets project standards
- Implementation follows Chrondle conventions
- No technical debt introduced
- Ready for user testing with dev server

## FAILURE PROTOCOLS

If unable to complete task:
- Document specific blockers encountered
- Update task with `[!]` blocked status
- Create new tasks for unblocking work
- Communicate clearly about obstacles
- Request user assistance for dev server testing if needed

## CHRONDLE-SPECIFIC REMINDERS

- **Preserve game mechanics**: Maintain the core historical guessing experience
- **Maintain data compatibility**: Users should not lose progress or settings
- **Follow established patterns**: Use existing code conventions in `src/lib/`
- **Build successfully**: Always ensure `npm run build` passes
- **Request testing**: Ask user to run dev server for functional validation

Execute the next task with strategic excellence and systematic precision.
