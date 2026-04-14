import type { ColumnDef } from "@tanstack/react-table";
import type { StockMovement, MovementType } from "../types/stock-movement.types";
import { MOVEMENT_TYPE_LABELS } from "../types/stock-movement.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

const TYPE_BADGE_STYLES: Record<MovementType, string> = {
  PURCHASE_IN: "border-green-500 text-green-600",
  SALE_OUT: "border-red-500 text-red-600",
  ADJUSTMENT_IN: "border-blue-500 text-blue-600",
  ADJUSTMENT_OUT: "border-yellow-500 text-yellow-600",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-NI", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getMovementColumns(): ColumnDef<StockMovement>[] {
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
      id: "product",
      accessorFn: (row) => row.product.name,
      header: "Producto",
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue() as string}</span>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ getValue }) => {
        const type = getValue() as MovementType;
        return (
          <Badge variant="outline" className={TYPE_BADGE_STYLES[type]}>
            {MOVEMENT_TYPE_LABELS[type]}
          </Badge>
        );
      },
      filterFn: "equalsString",
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cantidad
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      ),
      cell: ({ getValue }) => {
        const qty = getValue() as number;
        return (
          <div className="text-right tabular-nums font-medium">
            <span className={qty > 0 ? "text-green-600" : "text-red-600"}>
              {qty > 0 ? "+" : ""}
              {qty}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "batchNumber",
      header: "Lote",
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">
          {(getValue() as string) || "—"}
        </span>
      ),
    },
    {
      accessorKey: "expirationDate",
      header: "Vencimiento",
      cell: ({ getValue }) => {
        const val = getValue() as string | null;
        return (
          <span className="text-xs text-muted-foreground">
            {val ? new Date(val).toLocaleDateString("es-NI") : "—"}
          </span>
        );
      },
    },
    {
      id: "user",
      accessorFn: (row) => `${row.user.firstName} ${row.user.lastName}`,
      header: "Usuario",
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
  ];
}
