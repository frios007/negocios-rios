import { useMutation, useSuspenseQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSale,
  voidSale,
  addPayment,
} from "../api/sales.api";
import { salesQueryOptions, saleDetailQueryOptions } from "../api/sales.queries";
import type { CreateSalePayload } from "../types/sale.types";
import { useTenantKey, getTenantKey } from "@/lib/query/tenant-key";
import { toast } from "sonner";

export function useSales(page = 1, limit = 200) {
  const tenantKey = useTenantKey();
  return useSuspenseQuery(salesQueryOptions(tenantKey, page, limit));
}

// Sale detail is conditional (enabled only when id is set), so keep as useQuery
export function useSaleDetail(id: string | null) {
  const tenantKey = useTenantKey();
  return useQuery({
    ...saleDetailQueryOptions(tenantKey, id ?? ""),
    enabled: !!id,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSalePayload) => createSale(payload),
    onSuccess: () => {
      toast.success("Venta registrada correctamente");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "sales"] });
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "products"] });
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "clients"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Error al registrar la venta";
      toast.error(msg);
    },
  });
}

export function useVoidSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => voidSale(id),
    onSuccess: () => {
      toast.success("Venta anulada correctamente");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "sales"] });
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "products"] });
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "clients"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Error al anular la venta";
      toast.error(msg);
    },
  });
}

export function useAddPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      saleId,
      ...payload
    }: {
      saleId: string;
      amount: number;
      paymentMethod: string;
      referenceNumber?: string;
    }) => addPayment(saleId, payload),
    onSuccess: () => {
      toast.success("Pago registrado correctamente");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "sales"] });
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "clients"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Error al registrar el pago";
      toast.error(msg);
    },
  });
}
