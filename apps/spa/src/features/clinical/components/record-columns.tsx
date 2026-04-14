import type { ColumnDef } from "@tanstack/react-table";
import type { ClinicalRecord, RecordStatus } from "../types/clinical.types";
import { RECORD_STATUS_LABELS, RECORD_STATUS_COLORS } from "../types/clinical.types";
import { Badge } from "@/components/ui/badge";

export function getRecordColumns(): ColumnDef<ClinicalRecord>[] {
  return [
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ getValue }) =>
        new Date(getValue() as string).toLocaleDateString("es-NI", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      filterFn: "inDateRange" as any,
    },
    {
      id: "patientName",
      header: "Paciente",
      accessorFn: (row) => row.patient?.name ?? "—",
      cell: ({ row }) => {
        const p = row.original.patient;
        return (
          <div>
            <p className="font-medium">{p?.name ?? "—"}</p>
            <p className="text-xs text-muted-foreground">{p?.species}</p>
          </div>
        );
      },
    },
    {
      id: "owner",
      header: "Dueño",
      accessorFn: (row) => {
        const c = row.patient?.client;
        return c ? `${c.firstName} ${c.lastName ?? ""}`.trim() : "—";
      },
    },
    {
      accessorKey: "reason",
      header: "Motivo",
      cell: ({ getValue }) => (
        <span className="line-clamp-1 text-sm">{getValue() as string}</span>
      ),
    },
    {
      id: "vitals",
      header: "Signos",
      cell: ({ row }) => {
        const w = row.original.weight;
        const t = row.original.temperature;
        if (!w && !t) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="text-xs text-muted-foreground">
            {w && <span>{w} kg</span>}
            {w && t && <span> · </span>}
            {t && <span>{t}°C</span>}
          </div>
        );
      },
    },
    {
      id: "vetName",
      header: "Veterinario",
      accessorFn: (row) =>
        row.vet ? `${row.vet.firstName} ${row.vet.lastName}` : "—",
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ getValue }) => {
        const status = getValue() as RecordStatus;
        return (
          <Badge
            variant="outline"
            className={`${RECORD_STATUS_COLORS[status]} border-0 text-xs`}
          >
            {RECORD_STATUS_LABELS[status]}
          </Badge>
        );
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
  ];
}
