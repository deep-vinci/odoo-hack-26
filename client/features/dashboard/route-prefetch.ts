import type { QueryClient } from "@tanstack/react-query";

export const routeQueryPrefetchers: Record<
  string,
  (qc: QueryClient) => void
> = {};

export function prefetchRouteQueries(qc: QueryClient, href: string) {
  routeQueryPrefetchers[href]?.(qc);
}
