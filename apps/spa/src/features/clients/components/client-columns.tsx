import type { ColumnDef } from "@tanstack/react-table";
import type { Client } from "../types/client.types";
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

export function getClientColumns(actions: {
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}): ColumnDef<Client>[] {
  return [
    {
      id: "fullName",
      accessorFn: (row) =>
        `${row.firstName}${row.lastName ? ` ${row.lastName}` : ""}`,
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
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue() as string}</span>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "phoneNumber",
      header: "Teléfono",
      cell: ({ getValue }) => (getValue() as string) || "—",
    },
    {
      accessorKey: "documentId",
      header: "Documento",
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {(getValue() as string) || "—"}
        </span>
      ),
    },
    {
      accessorKey: "creditLimit",
      header: "Límite Crédito",
      cell: ({ getValue }) => (
        <span className="tabular-nums">
          {formatCurrency(getValue() as string)}
        </span>
      ),
    },
    {
      accessorKey: "balanceDue",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Saldo Pendiente
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      ),
      cell: ({ getValue }) => {
        const val = Number(getValue() as string);
        return (
          <div className="tabular-nums">
            {val > 0 ? (
              <Badge
                variant="outline"
                className="border-red-500 text-red-600 tabular-nums"
              >
                {formatCurrency(String(val))}
              </Badge>
            ) : (
              <span className="text-muted-foreground">
                {formatCurrency(String(val))}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const client = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => actions.onEdit(client)}>
                <Pencil className="mr-2 size-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => actions.onDelete(client)}
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
