import type { ColumnDef } from "@tanstack/react-table";
import type { Expense } from "../types/finance.types";
import { EXPENSE_PAYMENT_METHOD_LABELS } from "../types/finance.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

function formatCurrency(value: string) {
  return `C$ ${Number(value).toFixed(2)}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-NI", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const METHOD_STYLES: Record<string, string> = {
  CASH: "border-green-500 text-green-600",
  CARD: "border-blue-500 text-blue-600",
  TRANSFER: "border-violet-500 text-violet-600",
};

interface ExpenseColumnOptions {
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function getExpenseColumns(options: ExpenseColumnOptions): ColumnDef<Expense>[] {
  return [
    {
      accessorKey: "expenseDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      ),
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDate(getValue() as string)}
        </span>
      ),
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || typeof filterValue !== "object") return true;
        const { from, to } = filterValue as { from: string; to: string };
        const rowDate = new Date(row.getValue(columnId) as string);
        const fromDate = new Date(from);
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        return rowDate >= fromDate && rowDate <= toDate;
      },
    },
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue() as string}</span>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Monto
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      ),
      cell: ({ getValue }) => (
        <div className="font-medium tabular-nums text-red-600">
          {formatCurrency(getValue() as string)}
        </div>
      ),
    },
    {
      id: "category",
      accessorFn: (row) => row.category?.name ?? "Sin categoría",
      header: "Categoría",
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return val === "Sin categoría" ? (
          <span className="text-muted-foreground text-sm">{val}</span>
        ) : (
          <Badge variant="outline">{val}</Badge>
        );
      },
      filterFn: "equalsString",
    },
    {
      accessorKey: "paymentMethod",
      header: "Método",
      cell: ({ getValue }) => {
        const method = getValue() as string;
        return (
          <Badge variant="outline" className={METHOD_STYLES[method]}>
            {EXPENSE_PAYMENT_METHOD_LABELS[method as keyof typeof EXPENSE_PAYMENT_METHOD_LABELS]}
          </Badge>
        );
      },
      filterFn: "equalsString",
    },
    {
      id: "user",
      accessorFn: (row) =>
        row.user ? `${row.user.firstName} ${row.user.lastName}` : "—",
      header: "Registrado por",
      cell: ({ getValue }) => (
        <span className="text-xs">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "notes",
      header: "Notas",
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">
          {(getValue() as string) || "—"}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => options.onEdit(row.original)}>
              <Pencil className="mr-2 size-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => options.onDelete(row.original)}
            >
              <Trash2 className="mr-2 size-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
