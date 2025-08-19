app isn't working.

```
react-dom-client.development.js:25022 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
useAuthState.ts:52 [useAuthState] Auth loading...
logger.ts:8 [DEBUG] NumberTicker setting immediately to -2000
logger.ts:8 [DEBUG] NumberTicker setting immediately to 2025
useChrondle.ts:126 [4:44:15 PM] useChrondle: Initial state
logger.ts:13 [INFO] 📱 Service Worker registered successfully: ServiceWorkerRegistration
clerk.browser.js:16 Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview
warnOnce @ clerk.browser.js:16
content.js:1 User preferences loaded: Object
useChrondle.ts:148 [4:44:15 PM] useChrondle: Status change
useAuthState.ts:118 [useAuthState] User authenticated: Object
useChrondle.ts:148 [4:44:16 PM] useChrondle: Status change
error-boundary-callbacks.ts:80 Error: [CONVEX Q(puzzles:getUserPlay)] [Request ID: e19e4d22573ae607] Server Error
  Called by client
    at OptimisticQueryResults.queryResult (optimistic_updates_impl.ts:230:13)
    at BaseConvexClient.localQueryResult (client.ts:664:40)
    at Object.localQueryResult (client.ts:408:34)
    at QueriesObserver.getLocalResults (queries_observer.ts:99:23)
    at useQueriesHelper.useMemo[subscription] (use_queries.ts:104:25)
    at useSubscription.useEffect.checkForUpdates (use_subscription.ts:117:23)
    at basicStateReducer (react-dom-client.development.js:6939:45)
    at dispatchSetStateInternal (react-dom-client.development.js:8106:28)
    at dispatchSetState (react-dom-client.development.js:8081:7)
    at useSubscription.useEffect.checkForUpdates (use_subscription.ts:102:7)
    at QueriesObserver.notifyListeners (queries_observer.ts:165:7)
    at queries_observer.ts:145:51
    at ConvexReactClient.transition (client.ts:544:11)
    at client.ts:299:32
    at client.ts:327:7
    at BaseConvexClient.handleTransition (client.ts:562:7)
    at BaseConvexClient.notifyOnQueryResultChanges (client.ts:538:10)
    at WebSocketManager.onMessage (client.ts:422:20)
    at ws.onmessage (web_socket_manager.ts:279:29)

The above error occurred in the <ChronldeGameContent> component. It was handled by the <GameErrorBoundary> error boundary.
onCaughtError @ error-boundary-callbacks.ts:80
intercept-console-error.ts:40 [ERROR] Game Error Boundary caught an error: Error: [CONVEX Q(puzzles:getUserPlay)] [Request ID: e19e4d22573ae607] Server Error
  Called by client
    at OptimisticQueryResults.queryResult (optimistic_updates_impl.ts:230:13)
    at BaseConvexClient.localQueryResult (client.ts:664:40)
    at Object.localQueryResult (client.ts:408:34)
    at QueriesObserver.getLocalResults (queries_observer.ts:99:23)
    at useQueriesHelper.useMemo[subscription] (use_queries.ts:104:25)
    at useSubscription.useEffect.checkForUpdates (use_subscription.ts:117:23)
    at basicStateReducer (react-dom-client.development.js:6939:45)
    at dispatchSetStateInternal (react-dom-client.development.js:8106:28)
    at dispatchSetState (react-dom-client.development.js:8081:7)
    at useSubscription.useEffect.checkForUpdates (use_subscription.ts:102:7)
    at QueriesObserver.notifyListeners (queries_observer.ts:165:7)
    at queries_observer.ts:145:51
    at ConvexReactClient.transition (client.ts:544:11)
    at client.ts:299:32
    at client.ts:327:7
    at BaseConvexClient.handleTransition (client.ts:562:7)
    at BaseConvexClient.notifyOnQueryResultChanges (client.ts:538:10)
    at WebSocketManager.onMessage (client.ts:422:20)
    at ws.onmessage (web_socket_manager.ts:279:29)
error @ intercept-console-error.ts:40
intercept-console-error.ts:40 [ERROR] Component Stack:
    at ChronldeGameContent (http://localhost:3000/_next/static/chunks/src_8580f0d9._.js:10193:336)
    at GameErrorBoundary (http://localhost:3000/_next/static/chunks/src_8580f0d9._.js:9027:1)
    at ChronldePage (http://localhost:3000/_next/static/chunks/src_8580f0d9._.js:10562:338)
    at ClientPageRoot (http://localhost:3000/_next/static/chunks/9bf22_next_e560bba7._.js:8685:11)
    at InnerLayoutRouter (http://localhost:3000/_next/static/chunks/9bf22_next_e560bba7._.js:6944:11)
    at RedirectErrorBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:5236:9)
    at RedirectBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:5244:11)
    at HTTPAccessFallbackErrorBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:5936:9)
    at HTTPAccessFallbackBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:5944:11)
    at LoadingBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_e560bba7._.js:7025:11)
    at ErrorBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:1659:11)
    at InnerScrollAndFocusHandler (http://localhost:3000/_next/static/chunks/9bf22_next_e560bba7._.js:6841:9)
    at ScrollAndFocusHandler (http://localhost:3000/_next/static/chunks/9bf22_next_e560bba7._.js:6926:11)
    at RenderFromTemplateContext (http://localhost:3000/_next/static/chunks/9bf22_next_e560bba7._.js:7202:44)
    at OuterLayoutRouter (http://localhost:3000/_next/static/chunks/9bf22_next_e560bba7._.js:7061:11)
    at SessionThemeProvider (http://localhost:3000/_next/static/chunks/_301394ef._.js:1026:33)
    at UserCreationProvider (http://localhost:3000/_next/static/chunks/_301394ef._.js:1364:33)
    at ConvexProvider (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:5128:27)
    at ConvexProviderWithAuth (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:5933:35)
    at ConvexProviderWithClerk (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:6141:36)
    at SWRConfig (http://localhost:3000/_next/static/chunks/d69c2_swr_dist_df155b56._.js:574:13)
    at OrganizationProvider (http://localhost:3000/_next/static/chunks/95ad6_%40clerk_shared_dist_2a28a798._.js:1507:31)
    at ClerkContextProvider (http://localhost:3000/_next/static/chunks/e0982_%40clerk_clerk-react_dist_56f84b81._.js:2782:13)
    at ClerkProviderBase (http://localhost:3000/_next/static/chunks/e0982_%40clerk_clerk-react_dist_56f84b81._.js:2930:13)
    at Hoc (http://localhost:3000/_next/static/chunks/e0982_%40clerk_clerk-react_dist_56f84b81._.js:590:9)
    at ClerkNextOptionsProvider (http://localhost:3000/_next/static/chunks/node_modules__pnpm_100a4dc0._.js:248:13)
    at NextClientClerkProvider (http://localhost:3000/_next/static/chunks/node_modules__pnpm_100a4dc0._.js:714:13)
    at ClientClerkProvider (http://localhost:3000/_next/static/chunks/node_modules__pnpm_100a4dc0._.js:784:13)
    at ClerkProvider (http://localhost:3000/_next/static/chunks/node_modules__pnpm_100a4dc0._.js:924:304)
    at ErrorBoundary (http://localhost:3000/_next/static/chunks/_301394ef._.js:1118:1)
    at Providers (http://localhost:3000/_next/static/chunks/_301394ef._.js:1736:22)
    at body (<anonymous>)
    at html (<anonymous>)
    at RootLayout [Server] (<anonymous>)
    at RedirectErrorBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:5236:9)
    at RedirectBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:5244:11)
    at HTTPAccessFallbackErrorBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:5936:9)
    at HTTPAccessFallbackBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:5944:11)
    at DevRootHTTPAccessFallbackBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:6017:11)
    at AppDevOverlayErrorBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:1776:9)
    at AppDevOverlay (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:14456:11)
    at HotReload (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:15385:11)
    at Router (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:15710:11)
    at ErrorBoundaryHandler (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:1605:9)
    at ErrorBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:1659:11)
    at AppRouter (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:16009:11)
    at ServerRoot (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:19024:11)
    at Root (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:19044:11)
error @ intercept-console-error.ts:40
intercept-console-error.ts:40 🎮 Game Error Debug Info Object
error @ intercept-console-error.ts:40
turbopack-hot-reloader-common.ts:41 [Fast Refresh] rebuilding
report-hmr-latency.ts:26 [Fast Refresh] done in 668ms
...
Error: [CONVEX Q(puzzles:getUserPlay)] [Request ID: e19e4d22573ae607] Server Error
  Called by client
    at OptimisticQueryResults.queryResult (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:2302:19)
    at BaseConvexClient.localQueryResult (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:3844:44)
    at Object.localQueryResult (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:5010:44)
    at QueriesObserver.getLocalResults (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:5259:31)
    at useQueriesHelper.useMemo[subscription] (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:5442:41)
    at useSubscription.useEffect.checkForUpdates (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:5358:43)
    at basicStateReducer (http://localhost:3000/_next/static/chunks/9bf22_next_dist_compiled_7c0b275a._.js:6378:47)
    at dispatchSetStateInternal (http://localhost:3000/_next/static/chunks/9bf22_next_dist_compiled_7c0b275a._.js:7181:78)
    at dispatchSetState (http://localhost:3000/_next/static/chunks/9bf22_next_dist_compiled_7c0b275a._.js:7161:9)
    at useSubscription.useEffect.checkForUpdates (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:5353:21)
    at QueriesObserver.notifyListeners (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:5309:13)
    at http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:5291:53
    at ConvexReactClient.transition (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:5118:21)
    at http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:4934:453
    at http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:3596:13
    at BaseConvexClient.handleTransition (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:3770:13)
    at BaseConvexClient.notifyOnQueryResultChanges (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:3750:14)
    at WebSocketManager.onMessage (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:3661:34)
    at ws.onmessage (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:2781:35)
    at ChronldePage (http://localhost:3000/_next/static/chunks/src_8580f0d9._.js:10573:348)
    at ClientPageRoot (http://localhost:3000/_next/static/chunks/9bf22_next_e560bba7._.js:8713:50)
...
Error: [CONVEX Q(puzzles:getUserPlay)] [Request ID: e19e4d22573ae607] Server Error
  Called by client
    at OptimisticQueryResults.queryResult (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:2302:19)
    at BaseConvexClient.localQueryResult (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:3844:44)
    at Object.localQueryResult (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:5010:44)
    at QueriesObserver.getLocalResults (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:5259:31)
    at useQueriesHelper.useMemo[subscription] (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:5442:41)
    at useSubscription.useEffect.checkForUpdates (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:5358:43)
    at basicStateReducer (http://localhost:3000/_next/static/chunks/9bf22_next_dist_compiled_7c0b275a._.js:6378:47)
    at dispatchSetStateInternal (http://localhost:3000/_next/static/chunks/9bf22_next_dist_compiled_7c0b275a._.js:7181:78)
    at dispatchSetState (http://localhost:3000/_next/static/chunks/9bf22_next_dist_compiled_7c0b275a._.js:7161:9)
    at useSubscription.useEffect.checkForUpdates (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:5353:21)
    at QueriesObserver.notifyListeners (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:5309:13)
    at http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:5291:53
    at ConvexReactClient.transition (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:5118:21)
    at http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:4934:453
    at http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:3596:13
    at BaseConvexClient.handleTransition (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:3770:13)
    at BaseConvexClient.notifyOnQueryResultChanges (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:3750:14)
    at WebSocketManager.onMessage (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:3661:34)
    at ws.onmessage (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:2781:35)
    at ChronldePage (http://localhost:3000/_next/static/chunks/src_8580f0d9._.js:10571:341)
    at ClientPageRoot (http://localhost:3000/_next/static/chunks/9bf22_next_e560bba7._.js:8713:50)
...
Error: [ERROR] Component Stack: "\n    at ChronldeGameContent (http://localhost:3000/_next/static/chunks/src_8580f0d9._.js:10193:336)\n    at GameErrorBoundary (http://localhost:3000/_next/static/chunks/src_8580f0d9._.js:9027:1)\n    at ChronldePage (http://localhost:3000/_next/static/chunks/src_8580f0d9._.js:10562:338)\n    at ClientPageRoot (http://localhost:3000/_next/static/chunks/9bf22_next_e560bba7._.js:8685:11)\n    at InnerLayoutRouter (http://localhost:3000/_next/static/chunks/9bf22_next_e560bba7._.js:6944:11)\n    at RedirectErrorBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:5236:9)\n    at RedirectBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:5244:11)\n    at HTTPAccessFallbackErrorBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:5936:9)\n    at HTTPAccessFallbackBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:5944:11)\n    at LoadingBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_e560bba7._.js:7025:11)\n    at ErrorBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:1659:11)\n    at InnerScrollAndFocusHandler (http://localhost:3000/_next/static/chunks/9bf22_next_e560bba7._.js:6841:9)\n    at ScrollAndFocusHandler (http://localhost:3000/_next/static/chunks/9bf22_next_e560bba7._.js:6926:11)\n    at RenderFromTemplateContext (http://localhost:3000/_next/static/chunks/9bf22_next_e560bba7._.js:7202:44)\n    at OuterLayoutRouter (http://localhost:3000/_next/static/chunks/9bf22_next_e560bba7._.js:7061:11)\n    at SessionThemeProvider (http://localhost:3000/_next/static/chunks/_301394ef._.js:1026:33)\n    at UserCreationProvider (http://localhost:3000/_next/static/chunks/_301394ef._.js:1364:33)\n    at ConvexProvider (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:5128:27)\n    at ConvexProviderWithAuth (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:5933:35)\n    at ConvexProviderWithClerk (http://localhost:3000/_next/static/chunks/df8b0_convex_dist_esm_d3bcfbc4._.js:6141:36)\n    at SWRConfig (http://localhost:3000/_next/static/chunks/d69c2_swr_dist_df155b56._.js:574:13)\n    at OrganizationProvider (http://localhost:3000/_next/static/chunks/95ad6_%40clerk_shared_dist_2a28a798._.js:1507:31)\n    at ClerkContextProvider (http://localhost:3000/_next/static/chunks/e0982_%40clerk_clerk-react_dist_56f84b81._.js:2782:13)\n    at ClerkProviderBase (http://localhost:3000/_next/static/chunks/e0982_%40clerk_clerk-react_dist_56f84b81._.js:2930:13)\n    at Hoc (http://localhost:3000/_next/static/chunks/e0982_%40clerk_clerk-react_dist_56f84b81._.js:590:9)\n    at ClerkNextOptionsProvider (http://localhost:3000/_next/static/chunks/node_modules__pnpm_100a4dc0._.js:248:13)\n    at NextClientClerkProvider (http://localhost:3000/_next/static/chunks/node_modules__pnpm_100a4dc0._.js:714:13)\n    at ClientClerkProvider (http://localhost:3000/_next/static/chunks/node_modules__pnpm_100a4dc0._.js:784:13)\n    at ClerkProvider (http://localhost:3000/_next/static/chunks/node_modules__pnpm_100a4dc0._.js:924:304)\n    at ErrorBoundary (http://localhost:3000/_next/static/chunks/_301394ef._.js:1118:1)\n    at Providers (http://localhost:3000/_next/static/chunks/_301394ef._.js:1736:22)\n    at body (<anonymous>)\n    at html (<anonymous>)\n    at RootLayout [Server] (<anonymous>)\n    at RedirectErrorBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:5236:9)\n    at RedirectBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:5244:11)\n    at HTTPAccessFallbackErrorBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:5936:9)\n    at HTTPAccessFallbackBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:5944:11)\n    at DevRootHTTPAccessFallbackBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:6017:11)\n    at AppDevOverlayErrorBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:1776:9)\n    at AppDevOverlay (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:14456:11)\n    at HotReload (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:15385:11)\n    at Router (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:15710:11)\n    at ErrorBoundaryHandler (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:1605:9)\n    at ErrorBoundary (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:1659:11)\n    at AppRouter (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:16009:11)\n    at ServerRoot (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:19024:11)\n    at Root (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:19044:11)"
    at createConsoleError (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:882:71)
    at handleConsoleError (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:1058:54)
    at console.error (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:1223:57)
    at Object.error (http://localhost:3000/_next/static/chunks/_301394ef._.js:522:17)
    at GameErrorBoundary.componentDidCatch (http://localhost:3000/_next/static/chunks/src_8580f0d9._.js:9053:139)
    at ChronldePage (http://localhost:3000/_next/static/chunks/src_8580f0d9._.js:10571:341)
    at ClientPageRoot (http://localhost:3000/_next/static/chunks/9bf22_next_e560bba7._.js:8713:50)
...
Error: 🎮 Game Error Debug Info {}
    at createConsoleError (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:882:71)
    at handleConsoleError (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:1058:54)
    at console.error (http://localhost:3000/_next/static/chunks/9bf22_next_dist_client_3d678745._.js:1223:57)
    at GameErrorBoundary.reportGameError (http://localhost:3000/_next/static/chunks/src_8580f0d9._.js:9069:21)
    at GameErrorBoundary.componentDidCatch (http://localhost:3000/_next/static/chunks/src_8580f0d9._.js:9059:14)
    at ChronldePage (http://localhost:3000/_next/static/chunks/src_8580f0d9._.js:10571:341)
    at ClientPageRoot (http://localhost:3000/_next/static/chunks/9bf22_next_e560bba7._.js:8713:50)
```
