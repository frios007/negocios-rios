import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getTenantKey } from "@/lib/query/tenant-key";
import { useRecords } from "@/features/clinical/hooks/useClinical";
import {
  recordsQueryOptions,
  patientOptionsQueryOptions,
} from "@/features/clinical/api/clinical.queries";
import { RECORD_STATUS_LABELS } from "@/features/clinical/types/clinical.types";
import { getRecordColumns } from "@/features/clinical/components/record-columns";
import { RecordFormDialog } from "@/features/clinical/components/record-form-dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_auth/_appLayout/clinical/records")({
  component: RecordsPage,
  loader: async ({ context: { queryClient } }) => {
    const tenantKey = getTenantKey();
    await Promise.all([
      queryClient.ensureQueryData(recordsQueryOptions(tenantKey)),
      queryClient.ensureQueryData(patientOptionsQueryOptions(tenantKey)),
    ]);
  },
});

function RecordsPage() {
  const { data } = useRecords();
  const [formOpen, setFormOpen] = useState(false);

  const columns = useMemo(() => getRecordColumns(), []);

  const facetedFilters = useMemo(
    () => [
      {
        columnId: "status",
        label: "Estado",
        options: Object.entries(RECORD_STATUS_LABELS).map(
          ([value, label]) => ({ value, label }),
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Consultas</h1>
          <p className="text-muted-foreground">
            Historial de consultas y registros clínicos.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 size-4" />
          Nueva Consulta
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        renderToolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchColumnId="patientName"
            searchPlaceholder="Buscar por paciente..."
            facetedFilters={facetedFilters}
            dateRangeColumnId="createdAt"
            onDateRangeChange={(range) => {
              const column = table.getColumn("createdAt");
              column?.setFilterValue(range ?? undefined);
            }}
          />
        )}
      />

      <RecordFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
