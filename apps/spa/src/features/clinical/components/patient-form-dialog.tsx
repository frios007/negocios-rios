import { useState } from "react";
import type { Patient, CreatePatientPayload } from "../types/clinical.types";
import { COMMON_SPECIES } from "../types/clinical.types";
import { useCreatePatient, useUpdatePatient } from "../hooks/useClinical";
import { useQuery } from "@tanstack/react-query";
import { fetchClientOptions } from "@/features/clients/api/clients.api";
import { useTenantKey } from "@/lib/query/tenant-key";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
}

export function PatientFormDialog({ open, onOpenChange, patient }: Props) {
  const createMut = useCreatePatient();
  const updateMut = useUpdatePatient();
  const isEditing = !!patient;
  const isPending = createMut.isPending || updateMut.isPending;
  const tenantKey = useTenantKey();

  const [species, setSpecies] = useState(patient?.species ?? "Perro");
  const [sex, setSex] = useState(patient?.sex ?? "");
  const [clientId, setClientId] = useState(patient?.clientId ?? "");

  const { data: clientOptions } = useQuery({
    queryKey: [...tenantKey, "clients", "options"],
    queryFn: fetchClientOptions,
    enabled: open,
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string).trim();
    const breed = (fd.get("breed") as string).trim() || undefined;
    const color = (fd.get("color") as string).trim() || undefined;
    const dateOfBirth = (fd.get("dateOfBirth") as string) || undefined;

    if (isEditing) {
      updateMut.mutate(
        { id: patient.id, p: { name, species, breed, sex: sex || undefined, color, dateOfBirth } },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      if (!clientId) return;
      createMut.mutate(
        { name, species, breed, sex: sex || undefined, color, dateOfBirth, clientId } as CreatePatientPayload,
        { onSuccess: () => onOpenChange(false) },
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Paciente" : "Nuevo Paciente"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifica los datos de la mascota."
                : "Registra una nueva mascota en el sistema."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="patientName">Nombre</Label>
                <Input
                  id="patientName"
                  name="name"
                  defaultValue={patient?.name ?? ""}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Especie</Label>
                <Select value={species} onValueChange={setSpecies}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_SPECIES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="breed">Raza</Label>
                <Input
                  id="breed"
                  name="breed"
                  placeholder="Ej: Golden Retriever"
                  defaultValue={patient?.breed ?? ""}
                />
              </div>
              <div className="grid gap-2">
                <Label>Sexo</Label>
                <Select value={sex} onValueChange={setSex}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Macho">Macho</SelectItem>
                    <SelectItem value="Hembra">Hembra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  name="color"
                  placeholder="Ej: Negro con blanco"
                  defaultValue={patient?.color ?? ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dateOfBirth">
                  Fecha de Nacimiento
                </Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  defaultValue={
                    patient?.dateOfBirth
                      ? new Date(patient.dateOfBirth)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                />
              </div>
            </div>

            {!isEditing && (
              <div className="grid gap-2">
                <Label>Dueño (Cliente)</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clientOptions?.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.firstName} {c.lastName ?? ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? "Guardar" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
