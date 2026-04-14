import { queryOptions } from "@tanstack/react-query";
import { fetchSales, fetchSaleById } from "./sales.api";

export const salesQueryOptions = (
  tenantKey: readonly [string, string],
  page = 1,
  limit = 200,
) =>
  queryOptions({
    queryKey: [...tenantKey, "sales", { page, limit }] as const,
    queryFn: () => fetchSales(page, limit),
  });

export const saleDetailQueryOptions = (
  tenantKey: readonly [string, string],
  id: string,
) =>
  queryOptions({
    queryKey: [...tenantKey, "sales", id] as const,
    queryFn: () => fetchSaleById(id),
    enabled: !!id,
  });
