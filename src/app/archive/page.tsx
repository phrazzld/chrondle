"use client";

import React from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useUserData } from "@/hooks/useUserData";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { Lock, Calendar, TrendingUp, Archive } from "lucide-react";

export default function ArchivePage() {
  const { isLoaded, isSignedIn } = useUser();
  const { isPremium, userStats } = useUserData();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader
        onShowSettings={() => {}}
        currentStreak={userStats?.currentStreak || 0}
      />

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-2">
            Puzzle Archive
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore and play past Chrondle puzzles
          </p>
        </div>

        {/* Loading State */}
        {!isLoaded && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">
              Loading archive...
            </div>
          </div>
        )}

        {/* Not Signed In State */}
        {isLoaded && !isSignedIn && (
          <Card className="p-8 text-center">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-heading font-semibold mb-2">
              Sign In to Access Archive
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create a free account to save your progress and explore our puzzle
              archive with a premium subscription.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/sign-in">
                <Button>Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="outline">Create Account</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Signed In but Not Premium */}
        {isLoaded && isSignedIn && !isPremium && (
          <div className="space-y-8">
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Archive className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-heading font-semibold mb-2">
                    Unlock Full Archive Access
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Get unlimited access to all past puzzles and track your
                    complete history.
                  </p>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl font-bold">$0.99</span>
                    <span className="text-muted-foreground">/month</span>
                    <span className="text-muted-foreground mx-2">or</span>
                    <span className="text-3xl font-bold">$5.99</span>
                    <span className="text-muted-foreground">/year</span>
                    <span className="text-sm text-green-600 font-medium ml-2">
                      (Save 50%)
                    </span>
                  </div>
                  <Button size="lg" className="font-semibold">
                    Upgrade to Premium
                  </Button>
                </div>
              </div>
            </Card>

            {/* Preview of locked puzzles */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Recent Puzzles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Placeholder locked puzzle cards */}
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="opacity-50">
                      <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>January {12 - i}, 2025</span>
                      </div>
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Premium User Archive */}
        {isLoaded && isSignedIn && isPremium && (
          <div className="space-y-8">
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Premium Member
                  </h2>
                  <p className="text-muted-foreground">
                    Full access to all {/* will be dynamic */}298 puzzles
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Manage Subscription
                </Button>
              </div>
            </Card>

            {/* Archive grid will go here */}
            <div className="text-center py-12 text-muted-foreground">
              Archive grid coming soon...
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
