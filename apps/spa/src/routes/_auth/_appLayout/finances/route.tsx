import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTenantKey, getTenantKey } from "@/lib/query/tenant-key";
import { createFileRoute } from "@tanstack/react-router";
import {
  useFinanceSummary,
  useMonthlyTrend,
  useExpenses,
  useExpenseCategories,
  useDeleteExpense,
} from "@/features/finance/hooks/useFinance";
import { useBusinessContext } from "@/features/auth/hooks/useBusinessContext";
import type { Expense } from "@/features/finance/types/finance.types";
import { EXPENSE_PAYMENT_METHOD_LABELS } from "@/features/finance/types/finance.types";
import { FinanceKpiCards } from "@/features/finance/components/finance-kpi-cards";
import { FinanceTrendChart } from "@/features/finance/components/finance-trend-chart";
import { getExpenseColumns } from "@/features/finance/components/expense-columns";
import { ExpenseFormDialog } from "@/features/finance/components/expense-form-dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { exportToCsv } from "@/lib/utils/csv-export";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Calendar } from "lucide-react";
import { expensesQueryOptions } from "@/features/finance/api/finance.queries";

export const Route = createFileRoute("/_auth/_appLayout/finances")({
  component: FinancesPage,
  loader: async ({ context: { queryClient } }) => {
    const tenantKey = getTenantKey();
    await queryClient.ensureQueryData(expensesQueryOptions(tenantKey));
  },
});

type Preset = "today" | "week" | "month" | "year" | "custom";

function getPresetRange(preset: Preset): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split("T")[0];

  switch (preset) {
    case "today":
      return { from: to, to };
    case "week": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return { from: d.toISOString().split("T")[0], to };
    }
    case "month": {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: d.toISOString().split("T")[0], to };
    }
    case "year": {
      const d = new Date(now.getFullYear(), 0, 1);
      return { from: d.toISOString().split("T")[0], to };
    }
    default:
      return { from: to, to };
  }
}

function FinancesPage() {
  const queryClient = useQueryClient();
  const tenantKey = useTenantKey();
  const { businessUnits, canSwitchBU } = useBusinessContext();

  // ─── Period Selector ─────────────────────────────────
  const [preset, setPreset] = useState<Preset>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const range =
    preset === "custom" && customFrom && customTo
      ? { from: customFrom, to: customTo }
      : getPresetRange(preset);

  // ─── Business Unit Filter (local, not global) ────────
  const [selectedBU, setSelectedBU] = useState<string>("all");
  const businessUnitId = selectedBU === "all" ? undefined : selectedBU;

  // ─── Data Hooks ──────────────────────────────────────
  const { data: summary, isLoading: summaryLoading } = useFinanceSummary(
    range.from,
    range.to,
    businessUnitId,
  );
  const { data: trend, isLoading: trendLoading } = useMonthlyTrend(
    6,
    businessUnitId,
  );
  const { data: expensesData } = useExpenses(
    1,
    200,
    businessUnitId,
  );
  const { data: categories } = useExpenseCategories(businessUnitId);
  const deleteMutation = useDeleteExpense();

  // ─── Local UI State ──────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  const columns = useMemo(
    () =>
      getExpenseColumns({
        onEdit: (e) => {
          setEditingExpense(e);
          setDialogOpen(true);
        },
        onDelete: setDeletingExpense,
      }),
    [],
  );

  const facetedFilters = useMemo(() => {
    const filters = [];

    if (categories?.length) {
      filters.push({
        columnId: "category",
        label: "Categoría",
        options: [...new Set(categories.map((c) => c.name))].map((name) => ({
          label: name,
          value: name,
        })),
      });
    }

    filters.push({
      columnId: "paymentMethod",
      label: "Método",
      options: Object.entries(EXPENSE_PAYMENT_METHOD_LABELS).map(
        ([value, label]) => ({ label, value }),
      ),
    });

    return filters;
  }, [categories]);


  return (
    <div className="space-y-6">
      {/* ─── Page Header ──────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finanzas</h1>
          <p className="text-muted-foreground">
            Resumen financiero y control de gastos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setEditingExpense(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 size-4" />
            Registrar Gasto
          </Button>
        </div>
      </div>

      {/* ─── Filters Row ─────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* BU Filter */}
        {canSwitchBU && (
          <Select value={selectedBU} onValueChange={setSelectedBU}>
            <SelectTrigger className="h-9 w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las unidades</SelectItem>
              {businessUnits.map((bu) => (
                <SelectItem key={bu.businessUnitId} value={bu.businessUnitId}>
                  {bu.businessUnit?.name ?? bu.businessUnitId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Period Presets */}
        <div className="flex items-center gap-1 rounded-md border p-0.5">
          {(
            [
              ["today", "Hoy"],
              ["week", "Semana"],
              ["month", "Mes"],
              ["year", "Año"],
            ] as const
          ).map(([key, label]) => (
            <Button
              key={key}
              variant={preset === key ? "default" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setPreset(key)}
            >
              {label}
            </Button>
          ))}
          <Button
            variant={preset === "custom" ? "default" : "ghost"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => {
              setPreset("custom");
              if (!customFrom) {
                const d = new Date();
                d.setMonth(d.getMonth() - 1);
                setCustomFrom(d.toISOString().split("T")[0]);
                setCustomTo(new Date().toISOString().split("T")[0]);
              }
            }}
          >
            <Calendar className="mr-1 size-3" />
            Personalizado
          </Button>
        </div>

        {/* Custom Date Inputs */}
        {preset === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="h-9 rounded-md border bg-transparent px-3 text-sm"
            />
            <span className="text-muted-foreground text-sm">—</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="h-9 rounded-md border bg-transparent px-3 text-sm"
            />
          </div>
        )}
      </div>

      {/* ─── KPI Cards ────────────────────────────────── */}
      <FinanceKpiCards summary={summary} isLoading={summaryLoading} />

      {/* ─── Trend Chart ──────────────────────────────── */}
      <FinanceTrendChart data={trend} isLoading={trendLoading} />

      {/* ─── Expenses Table ───────────────────────────── */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Gastos Registrados</h2>
        <DataTable
          columns={columns}
          data={expensesData?.data ?? []}
          renderToolbar={(table) => (
            <DataTableToolbar
              table={table}
              searchColumnId="description"
              searchPlaceholder="Buscar por descripción..."
              facetedFilters={facetedFilters}
              dateRangeColumnId="expenseDate"
              onDateRangeChange={(dateRange) => {
                const column = table.getColumn("expenseDate");
                column?.setFilterValue(dateRange ?? undefined);
              }}
              onRefresh={() =>
                queryClient.invalidateQueries({
                  queryKey: [...tenantKey, "finance"],
                })
              }
              onExport={() => {
                const rows = table.getFilteredRowModel().rows.map((r) => {
                  const e = r.original;
                  return [
                    e.expenseDate,
                    e.description,
                    e.amount,
                    e.category?.name ?? "",
                    EXPENSE_PAYMENT_METHOD_LABELS[e.paymentMethod],
                    e.user
                      ? `${e.user.firstName} ${e.user.lastName}`
                      : "",
                    e.notes ?? "",
                  ];
                });
                exportToCsv(
                  "gastos",
                  [
                    "Fecha",
                    "Descripción",
                    "Monto",
                    "Categoría",
                    "Método",
                    "Registrado por",
                    "Notas",
                  ],
                  rows,
                );
              }}
            />
          )}
        />
      </div>

      {/* ─── Dialogs ──────────────────────────────────── */}
      <ExpenseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        expense={editingExpense}
      />

      <ConfirmDeleteDialog
        open={!!deletingExpense}
        onOpenChange={(open) => {
          if (!open) setDeletingExpense(null);
        }}
        title="Eliminar Gasto"
        description={`¿Estás seguro de eliminar el gasto "${deletingExpense?.description}"?`}
        onConfirm={() => {
          if (deletingExpense) {
            deleteMutation.mutate(deletingExpense.id, {
              onSuccess: () => setDeletingExpense(null),
            });
          }
        }}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
