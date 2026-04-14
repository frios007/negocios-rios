import { queryOptions } from "@tanstack/react-query";
import { fetchCategories } from "./categories.api";

export const categoriesQueryOptions = (
  tenantKey: readonly [string, string],
  page = 1,
  limit = 200,
) =>
  queryOptions({
    queryKey: [...tenantKey, "categories", { page, limit }] as const,
    queryFn: () => fetchCategories(page, limit),
  });
