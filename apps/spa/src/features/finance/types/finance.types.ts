// ─── Summary ───────────────────────────────────────────
export interface FinanceSummary {
  income: number;
  expenses: number;
  netProfit: number;
  pendingCredit: number;
  salesCount: number;
  expensesCount: number;
  period: { from: string; to: string };
}

// ─── Monthly Trend ─────────────────────────────────────
export interface MonthlyTrendItem {
  month: string;
  income: number;
  expenses: number;
}

// ─── Expense Categories ────────────────────────────────
export interface ExpenseCategory {
  id: string;
  name: string;
  businessUnitId: string;
}

// ─── Expense ───────────────────────────────────────────
export type ExpensePaymentMethod = "CASH" | "CARD" | "TRANSFER";

export const EXPENSE_PAYMENT_METHOD_LABELS: Record<ExpensePaymentMethod, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
};

export interface Expense {
  id: string;
  description: string;
  amount: string;
  categoryId: string | null;
  userId: string;
  businessUnitId: string;
  expenseDate: string;
  paymentMethod: ExpensePaymentMethod;
  referenceNumber: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string } | null;
  user: { firstName: string; lastName: string } | null;
}

export interface CreateExpensePayload {
  description: string;
  amount: number;
  categoryId?: string;
  expenseDate?: string;
  paymentMethod?: ExpensePaymentMethod;
  referenceNumber?: string;
  notes?: string;
}

export interface CreateExpenseCategoryPayload {
  name: string;
}
