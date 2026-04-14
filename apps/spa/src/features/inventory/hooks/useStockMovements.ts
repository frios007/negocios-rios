import { useMutation, useSuspenseQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStockMovement,
} from "../api/stock-movements.api";
import { stockMovementsQueryOptions, productOptionsQueryOptions } from "../api/stock-movements.queries";
import type { CreateStockMovementPayload } from "../types/stock-movement.types";
import { useTenantKey, getTenantKey } from "@/lib/query/tenant-key";
import { toast } from "sonner";

export function useStockMovements(page = 1, limit = 200) {
  const tenantKey = useTenantKey();
  return useSuspenseQuery(stockMovementsQueryOptions(tenantKey, page, limit));
}

// Product options used inside dialogs — keep as useQuery
export function useProductOptions() {
  const tenantKey = useTenantKey();
  return useQuery(productOptionsQueryOptions(tenantKey));
}

export function useRecordMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStockMovementPayload) =>
      createStockMovement(payload),
    onSuccess: () => {
      toast.success("Movimiento registrado correctamente");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({
        queryKey: [...tenantKey, "stock-movements"],
      });
      // Also invalidate products since stock quantities changed
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "products"] });
    },
    onError: () => {
      toast.error("Error al registrar el movimiento");
    },
  });
}
