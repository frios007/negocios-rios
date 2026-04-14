import { useAuthStore } from "@/features/auth/store/auth.store";
import type { BusinessUnitType } from "@/lib/api/types";

/**
 * Derived selectors for the active business unit context.
 * These compute from the auth store — no duplicated state.
 */
export function useBusinessContext() {
  const activeBusinessUnitId = useAuthStore((s) => s.activeBusinessUnitId);
  const businessUnits = useAuthStore((s) => s.businessUnits);

  const activeBU = businessUnits.find(
    (bu) => bu.businessUnitId === activeBusinessUnitId,
  );

  const activeBusinessType: BusinessUnitType | null =
    activeBU?.businessUnit?.type ?? null;

  const activeRole = activeBU?.role ?? null;

  const isVet = activeBusinessType === "VETERINARY";
  const isPharmacy = activeBusinessType === "PHARMACY";
  const canSwitchBU = businessUnits.length > 1;

  return {
    activeBU,
    activeBusinessType,
    activeRole,
    isVet,
    isPharmacy,
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
