import type { ColumnDef } from "@tanstack/react-table";
import type { Sale } from "../types/sale.types";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  SALE_STATUS_LABELS,
} from "../types/sale.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

function formatCurrency(value: string) {
  return `C$ ${Number(value).toFixed(2)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-NI", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  PAID: "border-green-500 text-green-600",
  PENDING: "border-red-500 text-red-600",
  PARTIAL: "border-yellow-500 text-yellow-600",
};

const SALE_STATUS_STYLES: Record<string, string> = {
  COMPLETED: "border-green-500 text-green-600",
  VOIDED: "border-red-500 text-red-600",
};

export function getSaleColumns(): ColumnDef<Sale>[] {
  return [
    {
      accessorKey: "createdAt",
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
      id: "client",
      accessorFn: (row) =>
        row.client
          ? `${row.client.firstName}${row.client.lastName ? ` ${row.client.lastName}` : ""}`
          : "Sin cliente",
      header: "Cliente",
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return val === "Sin cliente" ? (
          <span className="text-muted-foreground">{val}</span>
        ) : (
          <span className="font-medium">{val}</span>
        );
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      ),
      cell: ({ getValue }) => (
        <div className="font-medium tabular-nums">
          {formatCurrency(getValue() as string)}
        </div>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Método",
      cell: ({ getValue }) => (
        <span className="text-sm">
          {PAYMENT_METHOD_LABELS[getValue() as keyof typeof PAYMENT_METHOD_LABELS]}
        </span>
      ),
      filterFn: "equalsString",
    },
    {
      accessorKey: "paymentStatus",
      header: "Pago",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        return (
          <Badge
            variant="outline"
            className={PAYMENT_STATUS_STYLES[status]}
          >
            {PAYMENT_STATUS_LABELS[status as keyof typeof PAYMENT_STATUS_LABELS]}
          </Badge>
        );
      },
      filterFn: "equalsString",
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        return (
          <Badge
            variant="outline"
            className={SALE_STATUS_STYLES[status]}
          >
            {SALE_STATUS_LABELS[status as keyof typeof SALE_STATUS_LABELS]}
          </Badge>
        );
      },
      filterFn: "equalsString",
    },
    {
      id: "user",
      accessorFn: (row) => `${row.user.firstName} ${row.user.lastName}`,
      header: "Vendedor",
      cell: ({ getValue }) => (
        <span className="text-xs">{getValue() as string}</span>
      ),
    },
  ];
}
