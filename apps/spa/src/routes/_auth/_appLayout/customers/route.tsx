import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTenantKey, getTenantKey } from "@/lib/query/tenant-key";
import { createFileRoute } from "@tanstack/react-router";
import { useClients } from "@/features/clients/hooks/useClients";
import type { Client } from "@/features/clients/types/client.types";
import { getClientColumns } from "@/features/clients/components/client-columns";
import { ClientFormDialog } from "@/features/clients/components/client-form-dialog";
import { ClientDeleteConfirm } from "@/features/clients/components/client-delete-confirm";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { exportToCsv } from "@/lib/utils/csv-export";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { clientsQueryOptions } from "@/features/clients/api/clients.queries";

export const Route = createFileRoute("/_auth/_appLayout/customers")({
  component: CustomersPage,
  loader: async ({ context: { queryClient } }) => {
    const tenantKey = getTenantKey();
    await queryClient.ensureQueryData(clientsQueryOptions(tenantKey));
  },
});

function CustomersPage() {
  const queryClient = useQueryClient();
  const tenantKey = useTenantKey();
  const { data } = useClients();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  const columns = useMemo(
    () =>
      getClientColumns({
        onEdit: (c) => {
          setEditingClient(c);
          setDialogOpen(true);
        },
        onDelete: setDeletingClient,
      }),
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gestión de clientes y créditos.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingClient(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          Nuevo Cliente
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        renderToolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchColumnId="fullName"
            searchPlaceholder="Buscar por nombre..."
            onRefresh={() => queryClient.invalidateQueries({ queryKey: [...tenantKey, "clients"] })}
            onExport={() => {
              const rows = table.getFilteredRowModel().rows.map((r) => {
                const c = r.original;
                return [
                  c.firstName,
                  c.lastName ?? "",
                  c.phoneNumber ?? "",
                  c.documentId ?? "",
                  c.creditLimit,
                  c.balanceDue,
                ];
              });
              exportToCsv(
                "clientes",
                [
                  "Nombre",
                  "Apellido",
                  "Teléfono",
                  "Documento",
                  "Límite Crédito",
                  "Saldo Pendiente",
                ],
                rows,
              );
            }}
          />
        )}
      />

      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={editingClient}
      />

      <ClientDeleteConfirm
        client={deletingClient}
        onClose={() => setDeletingClient(null)}
      />
    </div>
  );
}
