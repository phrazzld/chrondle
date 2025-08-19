"use client";

import { useEffect, useState, useRef } from "react";

/**
 * Hook that debounces a value by delaying updates until the value has been stable for the specified delay.
 * Useful for preventing rapid-fire API calls or expensive operations triggered by frequently changing values.
 *
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds before updating the debounced value
 * @returns The debounced value
 *
 * @example
 * ```typescript
 * // Debounce user ID during authentication transitions
 * const debouncedUserId = useDebouncedValue(userId, 100);
 *
 * // Use debounced value for queries to prevent rapid-fire requests
 * const { data } = useQuery(api.users.getUser, { userId: debouncedUserId });
 * ```
 *
 * @example
 * ```typescript
 * // Debounce search input
 * const [searchTerm, setSearchTerm] = useState("");
 * const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
 *
 * // Only search after user stops typing for 300ms
 * const searchResults = useSearch(debouncedSearchTerm);
 * ```
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Mark as mounted
    mountedRef.current = true;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // If delay is 0 or negative, update immediately
    if (delay <= 0) {
      setDebouncedValue(value);
      return;
    }

    // Set up new timeout
    timeoutRef.current = setTimeout(() => {
      // Only update if component is still mounted
      if (mountedRef.current) {
        setDebouncedValue(value);

        if (process.env.NODE_ENV === "development") {
          // Log debounce updates in development for debugging
          const isObject = typeof value === "object" && value !== null;
          const valueStr = isObject ? JSON.stringify(value) : String(value);
          console.error(
            `[useDebouncedValue] Value updated after ${delay}ms:`,
            valueStr.length > 50 ? valueStr.substring(0, 50) + "..." : valueStr,
          );
        }
      }
      timeoutRef.current = null;
    }, delay);

    // Cleanup function
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [value, delay]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return debouncedValue;
}

/**
 * Hook that debounces multiple values simultaneously.
 * Useful when you need to debounce multiple related values that should update together.
 *
 * @param values - An object containing the values to debounce
 * @param delay - The delay in milliseconds before updating the debounced values
 * @returns An object with the same keys containing the debounced values
 *
 * @example
 * ```typescript
 * // Debounce both userId and puzzleId together
 * const debouncedIds = useDebouncedValues(
 *   { userId, puzzleId },
 *   100
 * );
 *
 * // Use debounced values for queries
 * const { data } = useQuery(api.puzzles.getUserPlay, {
 *   userId: debouncedIds.userId,
 *   puzzleId: debouncedIds.puzzleId
 * });
 * ```
 */
export function useDebouncedValues<T extends Record<string, unknown>>(
  values: T,
  delay: number,
): T {
  const [debouncedValues, setDebouncedValues] = useState<T>(values);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Mark as mounted
    mountedRef.current = true;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // If delay is 0 or negative, update immediately
    if (delay <= 0) {
      setDebouncedValues(values);
      return;
    }

    // Set up new timeout
    timeoutRef.current = setTimeout(() => {
      // Only update if component is still mounted
      if (mountedRef.current) {
        setDebouncedValues(values);

        if (process.env.NODE_ENV === "development") {
          // Log debounce updates in development for debugging
          const keys = Object.keys(values);
          console.error(
            `[useDebouncedValues] ${keys.length} values updated after ${delay}ms:`,
            keys.join(", "),
          );
        }
      }
      timeoutRef.current = null;
    }, delay);

    // Cleanup function
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [values, delay]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return debouncedValues;
}

/**
 * Hook that provides a debounced callback function.
 * The callback will only be invoked after it hasn't been called for the specified delay.
 *
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the callback
 *
 * @example
 * ```typescript
 * const debouncedSave = useDebouncedCallback(
 *   (data: FormData) => {
 *     saveToServer(data);
 *   },
 *   500
 * );
 *
 * // Call debouncedSave multiple times rapidly
 * // Only the last call will execute after 500ms of inactivity
 * onChange={(e) => debouncedSave(formData)}
 * ```
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const debouncedCallback = ((...args: Parameters<T>) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // If delay is 0 or negative, execute immediately
    if (delay <= 0) {
      return callback(...args);
    }

    // Set up new timeout
    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        callback(...args);
      }
      timeoutRef.current = null;
    }, delay);
  }) as T;

  return debouncedCallback;
}
