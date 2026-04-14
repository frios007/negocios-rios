import { useAuthStore } from "@/features/auth/store/auth.store";

/**
 * Returns a tenant-scoped query key prefix.
 * All data-fetching queries should use this so that switching
 * business units results in entirely separate cache entries.
 *
 * Usage:
 *   const tenantKey = useTenantKey();
 *   useQuery({ queryKey: [...tenantKey, "categories", { page }], ... })
 */
export function useTenantKey(): readonly [string, string] {
  const activeBusinessUnitId = useAuthStore((s) => s.activeBusinessUnitId);
  return ["tenant", activeBusinessUnitId ?? "none"] as const;
}

/**
 * Non-reactive version for use outside React (e.g., mutation callbacks).
 */
export function getTenantKey(): readonly [string, string] {
  const { activeBusinessUnitId } = useAuthStore.getState();
  return ["tenant", activeBusinessUnitId ?? "none"] as const;
}
