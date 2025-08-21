/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * why-did-you-render configuration
 * This file instruments React components to track unnecessary re-renders in development
 * Only active in development mode with explicit flag enabled
 */

import React from "react";

if (
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_WDYR === "true"
) {
  if (typeof window !== "undefined") {
    // Dynamic import to avoid loading in production
    import("@welldone-software/why-did-you-render").then((whyDidYouRender) => {
      whyDidYouRender.default(React, {
        // Track all pure components by default
        trackAllPureComponents: false,

        // Track hooks changes
        trackHooks: true,

        // Track extra hooks (useState, useReducer, etc)
        trackExtraHooks: [
          [require("react"), "useMemo"],
          [require("react"), "useCallback"],
          [require("react"), "useDeferredValue"],
        ],

        // Log on different values (even if component prevented re-render)
        logOnDifferentValues: false,

        // Include component owner in the log
        logOwnerReasons: true,

        // Collapse groups in console
        collapseGroups: true,

        // Custom notification for re-renders
        notifier: (updateInfo) => {
          const {
            displayName,
            reason,
            prevProps,
            nextProps,
            prevState,
            nextState,
          } = updateInfo;

          // Skip expected re-renders
          if (
            displayName?.includes("Provider") ||
            displayName?.includes("Context") ||
            displayName?.includes("Router")
          ) {
            return;
          }

          // Log only significant re-renders
          console.groupCollapsed(
            `%c[WDYR] ${displayName} re-rendered`,
            "color: orange; font-weight: bold;",
          );
          console.log("Reason:", reason);

          if (prevProps && nextProps) {
            console.log("Props changed:", { prevProps, nextProps });
          }

          if (prevState && nextState) {
            console.log("State changed:", { prevState, nextState });
          }

          console.groupEnd();
        },

        // Include and exclude patterns
        include: [
          // Components to track
          /^HintsDisplay$/,
          /^GuessHistory$/,
          /^GameControls$/,
          /^GameLayout$/,
          /^ChronldeGameContent$/,
        ],

        exclude: [
          // Components to ignore
          /^Connect/,
          /^Route/,
          /^Provider/,
        ],
      });

      console.log(
        "%c[WDYR] why-did-you-render enabled for development",
        "color: green; font-weight: bold;",
      );
    });
  }
}
