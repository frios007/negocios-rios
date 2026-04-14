import { queryOptions } from "@tanstack/react-query";
import { fetchClients, fetchClientOptions } from "./clients.api";

export const clientsQueryOptions = (
  tenantKey: readonly [string, string],
  page = 1,
  limit = 200,
) =>
  queryOptions({
    queryKey: [...tenantKey, "clients", { page, limit }] as const,
    queryFn: () => fetchClients(page, limit),
  });

export const clientOptionsQueryOptions = (
  tenantKey: readonly [string, string],
) =>
  queryOptions({
    queryKey: [...tenantKey, "clients", "options"] as const,
    queryFn: fetchClientOptions,
    staleTime: 5 * 60 * 1000,
  });
