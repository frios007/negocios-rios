import { apiClient } from "@/lib/api/api-client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  FinanceSummary,
  MonthlyTrendItem,
  ExpenseCategory,
  Expense,
  CreateExpensePayload,
  CreateExpenseCategoryPayload,
} from "../types/finance.types";

// ─── Summary ───────────────────────────────────────────

export async function fetchFinanceSummary(
  from: string,
  to: string,
  businessUnitId?: string,
): Promise<FinanceSummary> {
  const params: Record<string, string> = { from, to };
  if (businessUnitId) params.businessUnitId = businessUnitId;
  const { data } = await apiClient.get<ApiResponse<FinanceSummary>>(
    "/finance/summary",
    { params },
  );
  return data.data;
}

export async function fetchMonthlyTrend(
  months: number = 6,
  businessUnitId?: string,
): Promise<MonthlyTrendItem[]> {
  const params: Record<string, string> = { months: String(months) };
  if (businessUnitId) params.businessUnitId = businessUnitId;
  const { data } = await apiClient.get<ApiResponse<MonthlyTrendItem[]>>(
    "/finance/monthly-trend",
    { params },
  );
  return data.data;
}

// ─── Expense Categories ────────────────────────────────

export async function fetchExpenseCategories(
  businessUnitId?: string,
): Promise<ExpenseCategory[]> {
  const params: Record<string, string> = {};
  if (businessUnitId) params.businessUnitId = businessUnitId;
  const { data } = await apiClient.get<ApiResponse<ExpenseCategory[]>>(
    "/finance/expense-categories",
    { params },
  );
  return data.data;
}

export async function createExpenseCategory(
  payload: CreateExpenseCategoryPayload,
): Promise<ExpenseCategory> {
  const { data } = await apiClient.post<ApiResponse<ExpenseCategory>>(
    "/finance/expense-categories",
    payload,
  );
  return data.data;
}

export async function deleteExpenseCategory(id: string): Promise<void> {
  await apiClient.delete(`/finance/expense-categories/${id}`);
}

// ─── Expenses ──────────────────────────────────────────

export async function fetchExpenses(
  page: number = 1,
  limit: number = 200,
  businessUnitId?: string,
): Promise<{ data: Expense[]; meta: any }> {
  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
  };
  if (businessUnitId) params.businessUnitId = businessUnitId;
  const { data } = await apiClient.get<any>("/finance/expenses", { params });
  return { data: data.data, meta: data.meta };
}

export async function createExpense(
  payload: CreateExpensePayload,
): Promise<Expense> {
  const { data } = await apiClient.post<ApiResponse<Expense>>(
    "/finance/expenses",
    payload,
  );
  return data.data;
}

export async function updateExpense(
  id: string,
  payload: Partial<CreateExpensePayload>,
): Promise<Expense> {
  const { data } = await apiClient.patch<ApiResponse<Expense>>(
    `/finance/expenses/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteExpense(id: string): Promise<void> {
  await apiClient.delete(`/finance/expenses/${id}`);
}
