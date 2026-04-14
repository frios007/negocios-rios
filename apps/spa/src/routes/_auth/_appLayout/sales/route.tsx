import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTenantKey, getTenantKey } from "@/lib/query/tenant-key";
import { createFileRoute } from "@tanstack/react-router";
import { useSales } from "@/features/sales/hooks/useSales";
import type { Sale } from "@/features/sales/types/sale.types";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  SALE_STATUS_LABELS,
} from "@/features/sales/types/sale.types";
import { getSaleColumns } from "@/features/sales/components/sale-columns";
import { SaleDetailSheet } from "@/features/sales/components/sale-detail-sheet";
import { VoidSaleConfirm } from "@/features/sales/components/void-sale-confirm";
import { PosCheckoutSheet } from "@/features/sales/components/pos-checkout-sheet";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { exportToCsv } from "@/lib/utils/csv-export";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Ban, CreditCard } from "lucide-react";
import { salesQueryOptions } from "@/features/sales/api/sales.queries";

export const Route = createFileRoute("/_auth/_appLayout/sales")({
  component: SalesPage,
  loader: async ({ context: { queryClient } }) => {
    const tenantKey = getTenantKey();
    await queryClient.ensureQueryData(salesQueryOptions(tenantKey));
  },
});

function SalesPage() {
  const queryClient = useQueryClient();
  const tenantKey = useTenantKey();
  const { data } = useSales();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [voidingSale, setVoidingSale] = useState<Sale | null>(null);
  const [posOpen, setPosOpen] = useState(false);

  const columns = useMemo(() => {
    const baseCols = getSaleColumns();
    // Add actions column
    return [
      ...baseCols,
      {
        id: "actions",
        cell: ({ row }: any) => {
          const sale = row.original as Sale;
          if (sale.status === "VOIDED") return null;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {sale.paymentStatus !== "PAID" && (
                  <DropdownMenuItem onClick={() => setSelectedSale(sale)}>
                    <CreditCard className="mr-2 size-4" />
                    Ver detalles / Abonar
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setVoidingSale(sale)}
                >
                  <Ban className="mr-2 size-4" />
                  Anular
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ];
  }, []);

  const facetedFilters = useMemo(
    () => [
      {
        columnId: "paymentStatus",
        label: "Estado de pago",
        options: Object.entries(PAYMENT_STATUS_LABELS).map(
          ([value, label]) => ({ value, label }),
        ),
      },
      {
        columnId: "paymentMethod",
        label: "Método",
        options: Object.entries(PAYMENT_METHOD_LABELS).map(
          ([value, label]) => ({ value, label }),
        ),
      },
      {
        columnId: "status",
        label: "Estado",
        options: Object.entries(SALE_STATUS_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
      },
    ],
    [],
  );



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ventas</h1>
          <p className="text-muted-foreground">
            Historial de ventas y transacciones.
          </p>
        </div>
        <Button onClick={() => setPosOpen(true)}>
          <Plus className="mr-2 size-4" />
          Nueva Venta
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        onRowClick={setSelectedSale}
        renderToolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchColumnId="client"
            searchPlaceholder="Buscar por cliente..."
            facetedFilters={facetedFilters}
            dateRangeColumnId="createdAt"
            onDateRangeChange={(range) => {
              const column = table.getColumn("createdAt");
              column?.setFilterValue(range ?? undefined);
            }}
            onRefresh={() =>
              queryClient.invalidateQueries({
                queryKey: [...tenantKey, "sales"],
              })
            }
            onExport={() => {
              const rows = table.getFilteredRowModel().rows.map((r) => {
                const s = r.original;
                return [
                  new Date(s.createdAt).toLocaleDateString("es-NI"),
                  s.client
                    ? `${s.client.firstName}${s.client.lastName ? ` ${s.client.lastName}` : ""}`
                    : "Sin cliente",
                  s.totalAmount,
                  PAYMENT_METHOD_LABELS[s.paymentMethod],
                  PAYMENT_STATUS_LABELS[s.paymentStatus],
                  SALE_STATUS_LABELS[s.status],
                  `${s.user.firstName} ${s.user.lastName}`,
                ];
              });
              exportToCsv(
                "ventas",
                [
                  "Fecha",
                  "Cliente",
                  "Total",
                  "Método",
                  "Estado Pago",
                  "Estado",
                  "Vendedor",
                ],
                rows,
              );
            }}
          />
        )}
      />

      <SaleDetailSheet
        sale={selectedSale}
        onClose={() => setSelectedSale(null)}
      />

      <VoidSaleConfirm
        sale={voidingSale}
        onClose={() => setVoidingSale(null)}
      />

      <PosCheckoutSheet open={posOpen} onOpenChange={setPosOpen} />
    </div>
  );
}
