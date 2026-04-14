import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getTenantKey } from "@/lib/query/tenant-key";
import { usePatients } from "@/features/clinical/hooks/useClinical";
import { patientsQueryOptions } from "@/features/clinical/api/clinical.queries";
import type { Patient } from "@/features/clinical/types/clinical.types";
import { COMMON_SPECIES } from "@/features/clinical/types/clinical.types";
import { getPatientColumns } from "@/features/clinical/components/patient-columns";
import { PatientFormDialog } from "@/features/clinical/components/patient-form-dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_auth/_appLayout/clinical/patients")({
  component: PatientsPage,
  loader: async ({ context: { queryClient } }) => {
    const tenantKey = getTenantKey();
    await queryClient.ensureQueryData(patientsQueryOptions(tenantKey));
  },
});

function PatientsPage() {
  const { data } = usePatients();
  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const columns = useMemo(() => getPatientColumns(), []);

  const facetedFilters = useMemo(
    () => [
      {
        columnId: "speciesIcon",
        label: "Especie",
        options: COMMON_SPECIES.map((s) => ({ value: s, label: s })),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground">
            Registro de mascotas atendidas.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingPatient(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          Nuevo Paciente
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        onRowClick={(p) => {
          setEditingPatient(p);
          setFormOpen(true);
        }}
        renderToolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchColumnId="name"
            searchPlaceholder="Buscar por nombre..."
          />
        )}
      />

      <PatientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        patient={editingPatient}
      />
    </div>
  );
}
