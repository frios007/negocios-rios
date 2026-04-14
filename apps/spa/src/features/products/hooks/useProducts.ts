import { useMutation, useSuspenseQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/products.api";
import {
  productsQueryOptions,
  categoryOptionsQueryOptions,
  supplierOptionsQueryOptions,
} from "../api/products.queries";
import type {
  CreateProductPayload,
  UpdateProductPayload,
} from "../types/product.types";
import { useTenantKey, getTenantKey } from "@/lib/query/tenant-key";
import { toast } from "sonner";

export function useProducts(page = 1, limit = 200) {
  const tenantKey = useTenantKey();
  return useSuspenseQuery(productsQueryOptions(tenantKey, page, limit));
}

export function useCategoryOptions() {
  const tenantKey = useTenantKey();
  return useSuspenseQuery(categoryOptionsQueryOptions(tenantKey));
}

export function useSupplierOptions() {
  const tenantKey = useTenantKey();
  return useSuspenseQuery(supplierOptionsQueryOptions(tenantKey));
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => createProduct(payload),
    onSuccess: () => {
      toast.success("Producto creado correctamente");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "products"] });
    },
    onError: () => {
      toast.error("Error al crear el producto");
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProductPayload;
    }) => updateProduct(id, payload),
    onSuccess: () => {
      toast.success("Producto actualizado correctamente");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "products"] });
    },
    onError: () => {
      toast.error("Error al actualizar el producto");
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      toast.success("Producto desactivado correctamente");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "products"] });
    },
    onError: () => {
      toast.error("Error al desactivar el producto");
    },
  });
}
