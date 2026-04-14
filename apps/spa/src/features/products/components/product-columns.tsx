import type { ColumnDef } from "@tanstack/react-table";
import type { Product } from "../types/product.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal, Pencil, Archive } from "lucide-react";

function formatCurrency(value: string) {
  return `C$ ${Number(value).toFixed(2)}`;
}

function stockBadge(qty: number) {
  if (qty <= 0)
    return (
      <Badge variant="destructive" className="tabular-nums">
        {qty}
      </Badge>
    );
  if (qty <= 10)
    return (
      <Badge
        variant="outline"
        className="border-yellow-500 text-yellow-600 tabular-nums"
      >
        {qty}
      </Badge>
    );
  return (
    <Badge
      variant="outline"
      className="border-green-500 text-green-600 tabular-nums"
    >
      {qty}
    </Badge>
  );
}

export function getProductColumns(actions: {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}): ColumnDef<Product>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-2 font-medium">
            {p.name}
            {p.isSample && (
              <Badge variant="secondary" className="text-xs">
                Muestra
              </Badge>
            )}
            {p.isRegulated && (
              <Badge
                variant="outline"
                className="border-orange-400 text-xs text-orange-600"
              >
                Regulado
              </Badge>
            )}
          </div>
        );
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "barcode",
      header: "Código",
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {(getValue() as string) || "—"}
        </span>
      ),
    },
    {
      id: "category",
      accessorFn: (row) => row.category?.name ?? "",
      header: "Categoría",
      cell: ({ getValue }) => (getValue() as string) || "—",
      filterFn: "equalsString",
    },
    {
      id: "supplier",
      accessorFn: (row) => row.supplier?.name ?? "",
      header: "Proveedor",
      cell: ({ getValue }) => (getValue() as string) || "—",
      filterFn: "equalsString",
    },
    {
      accessorKey: "costPrice",
      header: () => <div className="text-right">Costo</div>,
      cell: ({ getValue }) => (
        <div className="text-right tabular-nums">
          {formatCurrency(getValue() as string)}
        </div>
      ),
    },
    {
      accessorKey: "profitMargin",
      header: () => <div className="text-right">Margen</div>,
      cell: ({ getValue }) => (
        <div className="text-right tabular-nums">
          {Number(getValue() as string).toFixed(0)}%
        </div>
      ),
    },
    {
      accessorKey: "unitPrice",
      header: () => <div className="text-right">Precio Venta</div>,
      cell: ({ getValue }) => (
        <div className="text-right font-medium tabular-nums">
          {formatCurrency(getValue() as string)}
        </div>
      ),
    },
    {
      accessorKey: "stockQuantity",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Stock
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      ),
      cell: ({ getValue }) => (
        <div className="text-center">
          {stockBadge(getValue() as number)}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => actions.onEdit(product)}>
                <Pencil className="mr-2 size-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => actions.onDelete(product)}
              >
                <Archive className="mr-2 size-4" />
                Desactivar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
