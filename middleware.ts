import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define which routes should be protected
const isProtectedRoute = createRouteMatcher([
  "/archive(.*)", // Archive routes require authentication
  "/api/user(.*)", // User API routes
  "/api/subscription(.*)", // Subscription management
]);

// Define routes that should always be public
const isPublicRoute = createRouteMatcher([
  "/", // Home page (today's puzzle)
  "/api/historical-context(.*)", // Historical context API
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return;
  }

  // Protect specific routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
