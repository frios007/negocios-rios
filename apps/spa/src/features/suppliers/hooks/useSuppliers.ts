import { useMutation, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../api/suppliers.api";
import { suppliersQueryOptions } from "../api/suppliers.queries";
import type {
  CreateSupplierPayload,
  UpdateSupplierPayload,
} from "../types/supplier.types";
import { useTenantKey, getTenantKey } from "@/lib/query/tenant-key";
import { toast } from "sonner";

export function useSuppliers(page = 1, limit = 200) {
  const tenantKey = useTenantKey();
  return useSuspenseQuery(suppliersQueryOptions(tenantKey, page, limit));
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSupplierPayload) => createSupplier(payload),
    onSuccess: () => {
      toast.success("Proveedor creado correctamente");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "suppliers"] });
    },
    onError: () => {
      toast.error("Error al crear el proveedor");
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSupplierPayload;
    }) => updateSupplier(id, payload),
    onSuccess: () => {
      toast.success("Proveedor actualizado correctamente");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "suppliers"] });
    },
    onError: () => {
      toast.error("Error al actualizar el proveedor");
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => {
      toast.success("Proveedor eliminado correctamente");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "suppliers"] });
    },
    onError: () => {
      toast.error("Error al eliminar el proveedor");
    },
  });
}
