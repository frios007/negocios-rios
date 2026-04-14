import { queryOptions } from "@tanstack/react-query";
import { fetchSuppliers } from "./suppliers.api";

export const suppliersQueryOptions = (
  tenantKey: readonly [string, string],
  page = 1,
  limit = 200,
) =>
  queryOptions({
    queryKey: [...tenantKey, "suppliers", { page, limit }] as const,
    queryFn: () => fetchSuppliers(page, limit),
  });
