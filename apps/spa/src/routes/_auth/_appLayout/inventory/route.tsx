import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTenantKey, getTenantKey } from "@/lib/query/tenant-key";
import { createFileRoute } from "@tanstack/react-router";
import { useStockMovements } from "@/features/inventory/hooks/useStockMovements";
import type { StockMovement } from "@/features/inventory/types/stock-movement.types";
import { MOVEMENT_TYPE_LABELS } from "@/features/inventory/types/stock-movement.types";
import { getMovementColumns } from "@/features/inventory/components/movement-columns";
import { MovementFormDialog } from "@/features/inventory/components/movement-form-dialog";
import { MovementDetailSheet } from "@/features/inventory/components/movement-detail-sheet";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { exportToCsv } from "@/lib/utils/csv-export";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { stockMovementsQueryOptions } from "@/features/inventory/api/stock-movements.queries";

export const Route = createFileRoute("/_auth/_appLayout/inventory")({
  component: InventoryPage,
  loader: async ({ context: { queryClient } }) => {
    const tenantKey = getTenantKey();
    await queryClient.ensureQueryData(stockMovementsQueryOptions(tenantKey, 1, 200));
  },
});

function InventoryPage() {
  const queryClient = useQueryClient();
  const tenantKey = useTenantKey();
  const { data } = useStockMovements(1, 200);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] =
    useState<StockMovement | null>(null);

  const columns = useMemo(() => getMovementColumns(), []);

  const facetedFilters = useMemo(
    () => [
      {
        columnId: "type",
        label: "Tipo",
        options: Object.entries(MOVEMENT_TYPE_LABELS).map(([value, label]) => ({
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
          <h1 className="text-2xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground">
            Historial de movimientos de stock (Kardex).
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 size-4" />
          Registrar Movimiento
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        onRowClick={setSelectedMovement}
        renderToolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchColumnId="product"
            searchPlaceholder="Buscar por producto..."
            facetedFilters={facetedFilters}
            dateRangeColumnId="createdAt"
            onDateRangeChange={(range) => {
              const column = table.getColumn("createdAt");
              column?.setFilterValue(range ?? undefined);
            }}
            onRefresh={() => queryClient.invalidateQueries({ queryKey: [...tenantKey, "stock-movements"] })}
            onExport={() => {
              const rows = table.getFilteredRowModel().rows.map((r) => {
                const m = r.original;
                return [
                  new Date(m.createdAt).toLocaleDateString("es-NI"),
                  m.product.name,
                  MOVEMENT_TYPE_LABELS[m.type],
                  String(m.quantity),
                  m.batchNumber ?? "",
                  m.expirationDate
                    ? new Date(m.expirationDate).toLocaleDateString("es-NI")
                    : "",
                  `${m.user.firstName} ${m.user.lastName}`,
                  m.notes ?? "",
                ];
              });
              exportToCsv(
                "inventario",
                [
                  "Fecha",
                  "Producto",
                  "Tipo",
                  "Cantidad",
                  "Lote",
                  "Vencimiento",
                  "Usuario",
                  "Notas",
                ],
                rows,
              );
            }}
          />
        )}
      />

      <MovementFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <MovementDetailSheet
        movement={selectedMovement}
        onClose={() => setSelectedMovement(null)}
      />
    </div>
  );
}
