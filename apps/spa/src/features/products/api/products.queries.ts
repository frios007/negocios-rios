import { queryOptions } from "@tanstack/react-query";
import { fetchProducts, fetchCategoryOptions, fetchSupplierOptions } from "./products.api";

export const productsQueryOptions = (
  tenantKey: readonly [string, string],
  page = 1,
  limit = 200,
) =>
  queryOptions({
    queryKey: [...tenantKey, "products", { page, limit }] as const,
    queryFn: () => fetchProducts(page, limit),
  });

export const categoryOptionsQueryOptions = (
  tenantKey: readonly [string, string],
) =>
  queryOptions({
    queryKey: [...tenantKey, "categories", "options"] as const,
    queryFn: fetchCategoryOptions,
    staleTime: 5 * 60 * 1000,
  });

export const supplierOptionsQueryOptions = (
  tenantKey: readonly [string, string],
) =>
  queryOptions({
    queryKey: [...tenantKey, "suppliers", "options"] as const,
    queryFn: fetchSupplierOptions,
    staleTime: 5 * 60 * 1000,
  });
