import { useAuthStore } from "@/features/auth/store/auth.store";

/**
 * Derived selectors for the active branch (business unit) context.
 * These compute from the auth store — no duplicated state.
 */
export function useBusinessContext() {
  const activeBusinessUnitId = useAuthStore((s) => s.activeBusinessUnitId);
  const businessUnits = useAuthStore((s) => s.businessUnits);

  const activeBU = businessUnits.find(
    (bu) => bu.businessUnitId === activeBusinessUnitId,
  );

  const activeRole = activeBU?.role ?? null;

  const canSwitchBU = businessUnits.length > 1;

  return {
    activeBU,
    activeRole,
    canSwitchBU,
    businessUnits,
  };
}

export function getActiveBusinessUnit() {
  const { activeBusinessUnitId, businessUnits } = useAuthStore.getState();
  return businessUnits.find((bu) => bu.businessUnitId === activeBusinessUnitId);
}

export function getActiveRole() {
  const { businessUnits, activeBusinessUnitId } = useAuthStore.getState();
  const activeBU = businessUnits.find(
    (bu) => bu.businessUnitId === activeBusinessUnitId,
  );
  return activeBU?.role ?? null;
}
