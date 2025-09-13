// Auth configuration supporting both development and production domains
const authConfig = {
  providers: [
    {
      // Development Clerk domain
      domain: "https://healthy-doe-23.clerk.accounts.dev",
      applicationID: "convex",
    },
    {
      // Production Clerk domain (when you switch to production keys)
      domain: "https://clerk.chrondle.app",
      applicationID: "convex",
    },
  ],
};

export default authConfig;
