"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { SessionThemeProvider } from "@/components/SessionThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { UserCreationProvider } from "@/components/UserCreationProvider";

// Check for missing environment variables
const missingEnvVars: string[] = [];

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  missingEnvVars.push("NEXT_PUBLIC_CONVEX_URL");
}

if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  missingEnvVars.push("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
}

// Only initialize Convex client if we have the URL
const convex = process.env.NEXT_PUBLIC_CONVEX_URL
  ? new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL)
  : null;

// Component to display when environment variables are missing
function MissingEnvironmentVariables({ variables }: { variables: string[] }) {
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-destructive/10 border-2 border-destructive rounded-lg p-6">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Configuration Error
          </h1>

          <p className="text-foreground mb-6">
            {isProduction
              ? "The application is not properly configured. Please contact support."
              : "Missing required environment variables. This typically happens in preview deployments."}
          </p>

          {!isProduction && (
            <>
              <div className="bg-background rounded-md p-4 mb-6">
                <p className="font-semibold mb-2">Missing variables:</p>
                <ul className="list-disc list-inside space-y-1">
                  {variables.map((varName) => (
                    <li key={varName} className="font-mono text-sm">
                      {varName}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="font-semibold mb-2">
                    For Vercel deployments:
                  </h2>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Go to your Vercel dashboard</li>
                    <li>Navigate to Settings → Environment Variables</li>
                    <li>Add the missing variables for all environments</li>
                    <li>Trigger a new deployment</li>
                  </ol>
                </div>

                <div>
                  <h2 className="font-semibold mb-2">For local development:</h2>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>
                      Copy{" "}
                      <code className="bg-muted px-1 py-0.5 rounded">
                        .env.example
                      </code>{" "}
                      to{" "}
                      <code className="bg-muted px-1 py-0.5 rounded">
                        .env.local
                      </code>
                    </li>
                    <li>Fill in the missing values</li>
                    <li>Restart your development server</li>
                  </ol>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Note:</strong> Environment variables starting with{" "}
                  <code className="bg-background px-1 py-0.5 rounded">
                    NEXT_PUBLIC_
                  </code>{" "}
                  are embedded at build time. You&apos;ll need to rebuild after
                  adding them.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Show error UI if environment variables are missing
  if (missingEnvVars.length > 0) {
    return (
      <ErrorBoundary>
        <MissingEnvironmentVariables variables={missingEnvVars} />
      </ErrorBoundary>
    );
  }

  // TypeScript knows these are defined now due to the check above
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={clerkKey} dynamic>
        <ConvexProviderWithClerk client={convex!} useAuth={useAuth}>
          <UserCreationProvider>
            <SessionThemeProvider>{children}</SessionThemeProvider>
          </UserCreationProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
