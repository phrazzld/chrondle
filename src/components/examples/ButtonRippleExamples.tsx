"use client";

import React from "react";
import { Button } from "@/components/ui/button";

/**
 * Example demonstration of the ripple effect on buttons
 */
export const ButtonRippleExamples: React.FC = () => {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="mb-4 text-lg font-semibold">Button Ripple Effect Examples</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Click any button to see the ripple effect animation
        </p>
      </div>

      {/* Default Variant */}
      <div>
        <h3 className="text-muted-foreground mb-3 text-sm font-medium">Default Buttons</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="default" size="sm">
            Small Button
          </Button>
          <Button variant="default">Default Button</Button>
          <Button variant="default" size="lg">
            Large Button
          </Button>
        </div>
      </div>

      {/* Different Variants */}
      <div>
        <h3 className="text-muted-foreground mb-3 text-sm font-medium">Button Variants</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="default">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      {/* Icon Buttons */}
      <div>
        <h3 className="text-muted-foreground mb-3 text-sm font-medium">Icon Buttons</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="default" size="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Button>
          <Button variant="outline" size="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </Button>
          <Button variant="ghost" size="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Disabled State */}
      <div>
        <h3 className="text-muted-foreground mb-3 text-sm font-medium">
          Disabled State (No Ripple)
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button disabled>Disabled Button</Button>
          <Button variant="outline" disabled>
            Disabled Outline
          </Button>
        </div>
      </div>

      {/* Without Ripple */}
      <div>
        <h3 className="text-muted-foreground mb-3 text-sm font-medium">Without Ripple Effect</h3>
        <div className="flex flex-wrap gap-3">
          <Button ripple={false}>No Ripple</Button>
          <Button variant="outline" ripple={false}>
            No Ripple Outline
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-muted/50 mt-8 rounded-lg p-4">
        <h3 className="mb-2 font-medium">Notes:</h3>
        <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
          <li>The ripple effect is CSS-only and activates on button press</li>
          <li>It emanates from the center of the button</li>
          <li>Different button variants have tailored ripple colors</li>
          <li>The effect respects prefers-reduced-motion settings</li>
          <li>Disabled buttons don&apos;t show the ripple effect</li>
        </ul>
      </div>
    </div>
  );
};
