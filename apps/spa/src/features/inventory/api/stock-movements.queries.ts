import { queryOptions } from "@tanstack/react-query";
import { fetchStockMovements } from "./stock-movements.api";
import { fetchProductOptions } from "@/features/products/api/products.api";

export const stockMovementsQueryOptions = (
  tenantKey: readonly [string, string],
  page = 1,
  limit = 200,
) =>
  queryOptions({
    queryKey: [...tenantKey, "stock-movements", { page, limit }] as const,
    queryFn: () => fetchStockMovements(page, limit),
  });

export const productOptionsQueryOptions = (
  tenantKey: readonly [string, string],
) =>
  queryOptions({
    queryKey: [...tenantKey, "products", "options"] as const,
    queryFn: fetchProductOptions,
    staleTime: 5 * 60 * 1000,
  });
