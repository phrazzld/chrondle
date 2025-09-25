/**
 * Touch target size constants and utilities
 * Ensures compliance with WCAG 2.1 Level AAA (44x44px minimum)
 */

export const TOUCH_TARGET = {
  // Minimum touch target size for mobile (44x44px)
  MIN_SIZE: 44,
  MIN_SIZE_CLASS: "min-h-[44px] min-w-[44px]",

  // Standard button sizes with mobile-friendly dimensions
  BUTTON: {
    DEFAULT: "h-11", // 44px
    SMALL: "h-10 sm:h-8", // 40px on mobile, 32px on desktop
    LARGE: "h-12", // 48px
    ICON: "h-11 w-11 sm:h-10 sm:w-10", // 44x44px on mobile, 40x40px on desktop
  },

  // Input field heights
  INPUT: {
    DEFAULT: "h-12", // 48px
    SMALL: "h-11", // 44px
  },

  // Touch-friendly padding for clickable areas
  PADDING: {
    DEFAULT: "p-3", // 12px
    SMALL: "p-2.5", // 10px
  },
} as const;

/**
 * Helper function to ensure touch target compliance
 */
export function getTouchTargetClasses(
  type: "button" | "icon" | "input",
  size: "default" | "small" | "large" = "default",
): string {
  switch (type) {
    case "button":
      return size === "large"
        ? TOUCH_TARGET.BUTTON.LARGE
        : size === "small"
          ? TOUCH_TARGET.BUTTON.SMALL
          : TOUCH_TARGET.BUTTON.DEFAULT;
    case "icon":
      return TOUCH_TARGET.BUTTON.ICON;
    case "input":
      return size === "small" ? TOUCH_TARGET.INPUT.SMALL : TOUCH_TARGET.INPUT.DEFAULT;
    default:
      return TOUCH_TARGET.MIN_SIZE_CLASS;
  }
}
