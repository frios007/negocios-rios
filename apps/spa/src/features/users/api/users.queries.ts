import { queryOptions } from "@tanstack/react-query";
import { fetchUsers } from "./users.api";

export const usersQueryOptions = (
  tenantKey: readonly [string, string],
  page = 1,
  limit = 200,
) =>
  queryOptions({
    queryKey: [...tenantKey, "users", { page, limit }] as const,
    queryFn: () => fetchUsers(page, limit),
  });
