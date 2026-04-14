import { useState } from "react";
import type { CreateRecordPayload } from "../types/clinical.types";
import { useCreateRecord, usePatientOptions } from "../hooks/useClinical";
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
import { Textarea } from "@/components/ui/textarea";
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
}

export function RecordFormDialog({ open, onOpenChange }: Props) {
  const createMut = useCreateRecord();
  const { data: patientOpts } = usePatientOptions();
  const [patientId, setPatientId] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!patientId) return;
    const fd = new FormData(e.currentTarget);
    const payload: CreateRecordPayload = {
      patientId,
      reason: (fd.get("reason") as string).trim(),
      weight: (fd.get("weight") as string).trim() || undefined,
      temperature: (fd.get("temperature") as string).trim() || undefined,
      diagnosis: (fd.get("diagnosis") as string).trim() || undefined,
      prescription: (fd.get("prescription") as string).trim() || undefined,
      internalNotes: (fd.get("internalNotes") as string).trim() || undefined,
    };

    createMut.mutate(payload, {
      onSuccess: () => {
        setPatientId("");
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nueva Consulta</DialogTitle>
            <DialogDescription>
              Registra una nueva consulta veterinaria.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Paciente</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar paciente..." />
                </SelectTrigger>
                <SelectContent>
                  {patientOpts?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.species}) — {p.client.firstName}{" "}
                      {p.client.lastName ?? ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">Motivo de Consulta</Label>
              <Input
                id="reason"
                name="reason"
                placeholder="Ej: Control de vacunas"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.01"
                  placeholder="Ej: 12.50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="temperature">Temperatura (°C)</Label>
                <Input
                  id="temperature"
                  name="temperature"
                  type="number"
                  step="0.1"
                  placeholder="Ej: 38.5"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="diagnosis">Diagnóstico</Label>
              <Textarea
                id="diagnosis"
                name="diagnosis"
                placeholder="Diagnóstico del veterinario..."
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prescription">Prescripción</Label>
              <Textarea
                id="prescription"
                name="prescription"
                placeholder="Medicamentos y tratamiento..."
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="internalNotes">Notas Internas</Label>
              <Textarea
                id="internalNotes"
                name="internalNotes"
                placeholder="Notas privadas del veterinario..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMut.isPending || !patientId}
            >
              {createMut.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Registrar Consulta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
