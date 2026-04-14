import { queryOptions } from "@tanstack/react-query";
import {
  fetchFinanceSummary,
  fetchMonthlyTrend,
  fetchExpenseCategories,
  fetchExpenses,
} from "./finance.api";

// ─── Summary & Trend (dynamic params — used with useQuery) ──

export const financeSummaryQueryOptions = (
  tenantKey: readonly [string, string],
  from: string,
  to: string,
  businessUnitId?: string,
) =>
  queryOptions({
    queryKey: [...tenantKey, "finance", "summary", { from, to, businessUnitId }] as const,
    queryFn: () => fetchFinanceSummary(from, to, businessUnitId),
    enabled: !!from && !!to,
  });

export const monthlyTrendQueryOptions = (
  tenantKey: readonly [string, string],
  months: number = 6,
  businessUnitId?: string,
) =>
  queryOptions({
    queryKey: [...tenantKey, "finance", "monthly-trend", { months, businessUnitId }] as const,
    queryFn: () => fetchMonthlyTrend(months, businessUnitId),
  });

// ─── Expense Categories ─────────────────────────────────────

export const expenseCategoriesQueryOptions = (
  tenantKey: readonly [string, string],
  businessUnitId?: string,
) =>
  queryOptions({
    queryKey: [...tenantKey, "finance", "expense-categories", { businessUnitId }] as const,
    queryFn: () => fetchExpenseCategories(businessUnitId),
  });

// ─── Expenses ───────────────────────────────────────────────

export const expensesQueryOptions = (
  tenantKey: readonly [string, string],
  page = 1,
  limit = 200,
  businessUnitId?: string,
) =>
  queryOptions({
    queryKey: [...tenantKey, "finance", "expenses", { page, limit, businessUnitId }] as const,
    queryFn: () => fetchExpenses(page, limit, businessUnitId),
  });
