import { useMutation, useSuspenseQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createExpenseCategory,
  deleteExpenseCategory,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../api/finance.api";
import {
  financeSummaryQueryOptions,
  monthlyTrendQueryOptions,
  expenseCategoriesQueryOptions,
  expensesQueryOptions,
} from "../api/finance.queries";
import type { CreateExpensePayload, CreateExpenseCategoryPayload } from "../types/finance.types";
import { useTenantKey, getTenantKey } from "@/lib/query/tenant-key";
import { toast } from "sonner";

// ─── Summary & Trend (dynamic params — keep as useQuery) ────

export function useFinanceSummary(from: string, to: string, businessUnitId?: string) {
  const tenantKey = useTenantKey();
  return useQuery(financeSummaryQueryOptions(tenantKey, from, to, businessUnitId));
}

export function useMonthlyTrend(months: number = 6, businessUnitId?: string) {
  const tenantKey = useTenantKey();
  return useQuery(monthlyTrendQueryOptions(tenantKey, months, businessUnitId));
}

// ─── Expense Categories ────────────────────────────────────

export function useExpenseCategories(businessUnitId?: string) {
  const tenantKey = useTenantKey();
  return useQuery(expenseCategoriesQueryOptions(tenantKey, businessUnitId));
}

export function useCreateExpenseCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExpenseCategoryPayload) => createExpenseCategory(payload),
    onSuccess: () => {
      toast.success("Categoría de gasto creada");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "finance"] });
    },
    onError: () => toast.error("Error al crear la categoría"),
  });
}

export function useDeleteExpenseCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpenseCategory(id),
    onSuccess: () => {
      toast.success("Categoría de gasto eliminada");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "finance"] });
    },
    onError: () => toast.error("Error al eliminar la categoría"),
  });
}

// ─── Expenses ──────────────────────────────────────────────

export function useExpenses(page = 1, limit = 200, businessUnitId?: string) {
  const tenantKey = useTenantKey();
  return useSuspenseQuery(expensesQueryOptions(tenantKey, page, limit, businessUnitId));
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExpensePayload) => createExpense(payload),
    onSuccess: () => {
      toast.success("Gasto registrado correctamente");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "finance"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Error al registrar el gasto";
      toast.error(msg);
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateExpensePayload> }) =>
      updateExpense(id, payload),
    onSuccess: () => {
      toast.success("Gasto actualizado correctamente");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "finance"] });
    },
    onError: () => toast.error("Error al actualizar el gasto"),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      toast.success("Gasto eliminado correctamente");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "finance"] });
    },
    onError: () => toast.error("Error al eliminar el gasto"),
  });
}
