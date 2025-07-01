// TypeScript interfaces for AI Historical Context feature
// Defines clear contracts for API requests/responses and component state

/**
 * Request payload for historical context generation API
 */
export interface AIContextRequest {
  /** The target year for historical context */
  year: number;
  /** Array of historical events for the year */
  events: string[];
}

/**
 * Response from historical context generation API
 */
export interface AIContextResponse {
  /** Generated historical context text */
  context: string;
  /** The year this context is for */
  year: number;
  /** ISO timestamp when context was generated */
  generatedAt: string;
  /** Source identifier (e.g., 'openrouter-gemini') */
  source: string;
}

/**
 * Error response from API
 */
export interface AIContextError {
  /** Human-readable error message */
  error: string;
  /** Optional error code for programmatic handling */
  code?: string;
}

/**
 * State for AI context in React components
 */
export interface AIContextState {
  /** Generated context data, null if not loaded */
  data: AIContextResponse | null;
  /** Loading state indicator */
  loading: boolean;
  /** Error state, null if no error */
  error: string | null;
  /** Whether AI context feature is enabled */
  enabled: boolean;
}

/**
 * Cached context data for localStorage
 */
export interface CachedAIContext {
  /** The cached context response */
  context: AIContextResponse;
  /** Cache timestamp for TTL validation */
  cachedAt: number;
  /** Cache key for identification */
  cacheKey: string;
}

/**
 * Actions available for AI context hook
 */
export interface AIContextActions {
  /** Generate context for given year and events */
  generateContext: (year: number, events: string[]) => Promise<void>;
  /** Clear current context and error state */
  clearContext: () => void;
  /** Retry failed context generation */
  retryGeneration: () => Promise<void>;
  /** Toggle AI context feature on/off */
  toggleEnabled: () => void;
}

/**
 * Complete AI context hook return type
 */
export interface UseAIContextReturn extends AIContextState {
  /** Available actions */
  actions: AIContextActions;
}

/**
 * Props for AI context display components
 */
export interface AIContextDisplayProps {
  /** Current AI context state */
  context: AIContextState;
  /** Callback for retry action */
  onRetry?: () => void;
  /** Callback for toggle enabled state */
  onToggleEnabled?: () => void;
  /** Additional CSS classes */
  className?: string;
}