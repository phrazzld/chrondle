# Observability & Analytics

- Toggle Vercel **Web Analytics** and **Observability** for the project; deployment-level switches live under Vercel dashboard → project → Analytics/Observability.
- App Router renders `<Analytics />` from `@vercel/analytics/next` in `src/app/layout.tsx`, so page + user metrics ship once the feature flag is on.
- `src/instrumentation.ts` registers `@vercel/otel` with a service name of `chrondle`; logs + traces flow into Vercel when deployed.
- `onRequestError` funnels request context through our `logger`, giving consistent console output that Observability ingests without extra wiring.
- CSP now whitelists Vercel ingestion domains (see `next.config.ts`) to avoid blocked beacons.
- No runtime configuration needed beyond the Vercel toggles; local dev still works without the dashboards enabled.
