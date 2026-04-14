import { useMutation, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categories.api";
import { categoriesQueryOptions } from "../api/categories.queries";
import type {
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/category.types";
import { useTenantKey, getTenantKey } from "@/lib/query/tenant-key";
import { toast } from "sonner";

export function useCategories(page = 1, limit = 200) {
  const tenantKey = useTenantKey();
  return useSuspenseQuery(categoriesQueryOptions(tenantKey, page, limit));
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createCategory(payload),
    onSuccess: () => {
      toast.success("Categoría creada correctamente");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "categories"] });
    },
    onError: () => {
      toast.error("Error al crear la categoría");
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCategoryPayload;
    }) => updateCategory(id, payload),
    onSuccess: () => {
      toast.success("Categoría actualizada correctamente");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "categories"] });
    },
    onError: () => {
      toast.error("Error al actualizar la categoría");
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      toast.success("Categoría eliminada correctamente");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "categories"] });
    },
    onError: () => {
      toast.error("Error al eliminar la categoría");
    },
  });
}
