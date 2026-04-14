import type { ColumnDef } from "@tanstack/react-table";
import type { Patient } from "../types/clinical.types";
import { Cat, Bird, Rabbit, PiggyBank, Dog, Search } from "lucide-react";

function SpeciesIcon({ species }: { species: string }) {
  const s = species.toLowerCase();
  const cls = "size-5 text-muted-foreground";
  if (s === "gato") return <Cat className={cls} />;
  if (s === "ave") return <Bird className={cls} />;
  if (s === "conejo") return <Rabbit className={cls} />;
  if (s === "cerdo") return <PiggyBank className={cls} />;
  if (s === "perro") return <Dog className={cls} />;
  return <Search className={cls} />;
}

export function getPatientColumns(): ColumnDef<Patient>[] {
  return [
    {
      id: "speciesIcon",
      header: "",
      cell: ({ row }) => <SpeciesIcon species={row.original.species} />,
      size: 40,
    },
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.species}
            {row.original.breed ? ` · ${row.original.breed}` : ""}
          </p>
        </div>
      ),
    },
    {
      id: "owner",
      header: "Dueño",
      accessorFn: (row) =>
        `${row.client.firstName} ${row.client.lastName ?? ""}`.trim(),
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "sex",
      header: "Sexo",
      cell: ({ getValue }) => (
        <span className="text-sm">{(getValue() as string) || "—"}</span>
      ),
    },
    {
      id: "status",
      accessorKey: "isActive",
      header: "Estado",
      cell: ({ getValue }) => {
        const active = getValue() as boolean;
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`size-2 rounded-full ${active ? "bg-emerald-500" : "bg-red-500"}`}
            />
            <span className="text-sm">{active ? "Activo" : "Inactivo"}</span>
          </div>
        );
      },
    },
  ];
}
