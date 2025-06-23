'use client';

import React from 'react';
import { Card, SectionCard, CardHeader, CardContent } from './index';

/**
 * Demo component showcasing the Card system usage patterns
 * 
 * This component demonstrates the various ways to use the card system
 * following Dan Abramov's component composition principles.
 */
export const CardDemo: React.FC = () => {
  return (
    <div className="space-y-8 p-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-[var(--foreground)]">
          Card System Demo
        </h2>
        <p className="text-[var(--muted-foreground)] mb-8">
          Showcasing the modular React card system with various configurations and composition patterns.
        </p>
      </div>

      {/* Basic Cards */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-[var(--foreground)]">Basic Card Variants</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="primary" size="md">
            <CardContent>
              <h4 className="font-bold text-lg mb-2">Primary Card</h4>
              <p>Orange background with white text for primary actions and highlighted content.</p>
            </CardContent>
          </Card>
          
          <Card variant="secondary" size="md">
            <CardContent>
              <h4 className="font-bold text-lg mb-2 text-[var(--card-foreground)]">Secondary Card</h4>
              <p className="text-[var(--card-foreground)]">White background with border for general content areas.</p>
            </CardContent>
          </Card>
          
          <Card variant="success" size="md">
            <CardContent>
              <h4 className="font-bold text-lg mb-2">Success Card</h4>
              <p>Green background for success states and positive feedback.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section Cards */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-[var(--foreground)]">Section Cards with Numbers</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard sectionNumber={1} variant="primary" size="lg">
            <h4 className="text-xl font-bold mb-4">Event Display Section</h4>
            <p className="text-white opacity-95">
              This section shows the main historical event with proper section numbering and primary styling.
            </p>
          </SectionCard>
          
          <SectionCard sectionNumber={2} variant="secondary" size="md">
            <h4 className="text-xl font-bold mb-4 text-[var(--card-foreground)]">Input Section</h4>
            <p className="text-[var(--card-foreground)]">
              Secondary section for user inputs and controls with clean numbering badge.
            </p>
          </SectionCard>
        </div>
      </section>

      {/* Interactive Cards */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-[var(--foreground)]">Interactive Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="secondary" interactive elevated>
            <CardHeader>
              <h4 className="text-lg font-bold text-[var(--card-foreground)]">Interactive Card</h4>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--card-foreground)]">
                This card responds to hover with elevation and transform effects.
              </p>
            </CardContent>
          </Card>
          
          <Card variant="secondary" elevated>
            <CardHeader>
              <h4 className="text-lg font-bold text-[var(--card-foreground)]">Elevated Card</h4>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--card-foreground)]">
                Static elevated card with enhanced shadow for visual hierarchy.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Composition Examples */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-[var(--foreground)]">Component Composition</h3>
        <Card variant="secondary" size="lg">
          <CardHeader>
            <h4 className="text-2xl font-bold text-[var(--card-foreground)]">Composed Card Example</h4>
            <p className="text-[var(--muted-foreground)]">Demonstrating flexible composition patterns</p>
          </CardHeader>
          <CardContent padding="lg">
            <div className="space-y-4">
              <p className="text-[var(--card-foreground)]">
                This card demonstrates the composition pattern where CardHeader and CardContent
                can be used independently or together within the base Card component.
              </p>
              <div className="flex gap-4">
                <Card variant="primary" size="sm">
                  <CardContent padding="sm">
                    <span className="text-white font-medium">Nested Card 1</span>
                  </CardContent>
                </Card>
                <Card variant="success" size="sm">
                  <CardContent padding="sm">
                    <span className="text-white font-medium">Nested Card 2</span>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Size Variations */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-[var(--foreground)]">Size Variations</h3>
        <div className="space-y-4">
          <Card variant="secondary" size="sm">
            <CardContent>
              <span className="font-medium text-[var(--card-foreground)]">Small Card (sm)</span>
            </CardContent>
          </Card>
          <Card variant="secondary" size="md">
            <CardContent>
              <span className="font-medium text-[var(--card-foreground)]">Medium Card (md) - Default</span>
            </CardContent>
          </Card>
          <Card variant="secondary" size="lg">
            <CardContent>
              <span className="font-medium text-[var(--card-foreground)]">Large Card (lg)</span>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};