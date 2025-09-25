/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Simple runtime prop validation for critical components
 * Provides development-time checks without complex type gymnastics
 */

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Log validation warning in development
 */
function warn(componentName: string, message: string): void {
  if (isDevelopment) {
    console.warn(`[${componentName}] ${message}`);
  }
}

/**
 * Validate GameLayout critical props
 */
export function validateGameLayoutProps(props: unknown, componentName = "GameLayout"): void {
  if (!isDevelopment) return;

  const p = props as Record<string, any>;

  // Check gameState structure
  if (!p.gameState) {
    warn(componentName, "Missing required prop: gameState");
    return;
  }

  if (typeof p.gameState !== "object") {
    warn(componentName, "gameState must be an object");
    return;
  }

  // Check gameState.guesses is array
  if (!Array.isArray(p.gameState.guesses)) {
    warn(componentName, "gameState.guesses must be an array");
  }

  // Check gameState.isGameOver is boolean
  if (typeof p.gameState.isGameOver !== "boolean") {
    warn(componentName, "gameState.isGameOver must be a boolean");
  }

  // Check onGuess is function
  if (typeof p.onGuess !== "function") {
    warn(componentName, "onGuess must be a function");
  }

  // Check numeric props (removed currentHintIndex - now calculated internally)

  // Check boolean props
  const booleanProps = ["isGameComplete", "hasWon", "isLoading"];
  for (const propName of booleanProps) {
    if (typeof p[propName] !== "boolean") {
      warn(componentName, `${propName} must be a boolean`);
    }
  }
}

/**
 * Validate GuessInput critical props
 */
export function validateGuessInputProps(props: unknown, componentName = "GuessInput"): void {
  if (!isDevelopment) return;

  const p = props as Record<string, any>;

  // Check onGuess is function
  if (typeof p.onGuess !== "function") {
    warn(componentName, "onGuess must be a function");
  }

  // Check disabled is boolean
  if (typeof p.disabled !== "boolean") {
    warn(componentName, "disabled must be a boolean");
  }

  // Check remainingGuesses is valid number
  if (typeof p.remainingGuesses !== "number") {
    warn(componentName, "remainingGuesses must be a number");
  } else if (p.remainingGuesses < 0 || p.remainingGuesses > 6) {
    warn(componentName, "remainingGuesses must be between 0 and 6");
  }

  // Check optional onValidationError
  if (p.onValidationError !== undefined && typeof p.onValidationError !== "function") {
    warn(componentName, "onValidationError must be a function if provided");
  }
}

/**
 * Validate HintsDisplay critical props
 */
export function validateHintsDisplayProps(props: unknown, componentName = "HintsDisplay"): void {
  if (!isDevelopment) return;

  const p = props as Record<string, any>;

  // Check events array
  if (!Array.isArray(p.events)) {
    warn(componentName, "events must be an array");
  } else if (p.events.length > 0 && p.events.length !== 6) {
    warn(componentName, "events array must have exactly 6 items");
  }

  // Check guesses array
  if (!Array.isArray(p.guesses)) {
    warn(componentName, "guesses must be an array");
  }

  // Check targetYear is number
  if (typeof p.targetYear !== "number") {
    warn(componentName, "targetYear must be a number");
  }

  // Check error is null or string
  if (p.error !== null && typeof p.error !== "string") {
    warn(componentName, "error must be null or a string");
  }

  // Check isGameComplete is boolean if provided
  if (p.isGameComplete !== undefined && typeof p.isGameComplete !== "boolean") {
    warn(componentName, "isGameComplete must be a boolean");
  }
}
