import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { getQueryClient } from "./lib/query/query-client";

export interface RouterContext {
  queryClient: QueryClient;
}

export function getRouter() {
  const queryClient = getQueryClient();
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    context: {
      queryClient,
    },
    trailingSlash: "never",
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
