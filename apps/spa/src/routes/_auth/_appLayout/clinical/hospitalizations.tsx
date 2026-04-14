import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getTenantKey, useTenantKey } from "@/lib/query/tenant-key";
import {
  useHospitalizations,
  useCreateHospitalization,
  useDischargeHospitalization,
  useAddHospNote,
  useAddHospItem,
  useGenerateHospBill,
  usePatientOptions,
} from "@/features/clinical/hooks/useClinical";
import {
  hospitalizationsQueryOptions,
  patientOptionsQueryOptions,
} from "@/features/clinical/api/clinical.queries";
import { fetchHospitalization } from "@/features/clinical/api/hospitalizations.api";
import type {
  Hospitalization,
  HospitalizationStatus,
  CreateHospitalizationPayload,
  AddNotePayload,
  AddItemPayload,
} from "@/features/clinical/types/clinical.types";
import {
  HOSP_STATUS_LABELS,
  HOSP_STATUS_COLORS,
} from "@/features/clinical/types/clinical.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BedDouble,
  Plus,
  Clock,
  Thermometer,
  Weight,
  Receipt,
  LogOut,
  Loader2,
  PawPrint,
  StickyNote,
  Package,
} from "lucide-react";

export const Route = createFileRoute(
  "/_auth/_appLayout/clinical/hospitalizations",
)({
  component: HospitalizationsPage,
  loader: async ({ context: { queryClient } }) => {
    const tenantKey = getTenantKey();
    await Promise.all([
      queryClient.ensureQueryData(hospitalizationsQueryOptions(tenantKey)),
      queryClient.ensureQueryData(patientOptionsQueryOptions(tenantKey)),
    ]);
  },
});

// ─── Helper ──────────────────────────────────────────────
function daysSince(dateStr: string) {
  const d = new Date(dateStr);
  return Math.max(
    1,
    Math.ceil((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

function formatCurrency(val: string | number) {
  return `C$${Number(val).toFixed(2)}`;
}

// ─── Main Page ───────────────────────────────────────────
function HospitalizationsPage() {
  const { data } = useHospitalizations();
  const [admitOpen, setAdmitOpen] = useState(false);
  const [selectedHosp, setSelectedHosp] = useState<Hospitalization | null>(
    null,
  );

  const items = data?.data ?? [];
  const active = items.filter((h) => h.status === "ACTIVE");
  const discharged = items.filter((h) => h.status !== "ACTIVE");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hospitalización</h1>
          <p className="text-muted-foreground">
            Control de pacientes internados.
          </p>
        </div>
        <Button onClick={() => setAdmitOpen(true)}>
          <Plus className="mr-2 size-4" />
          Ingresar Paciente
        </Button>
      </div>

      {/* ─── Active Board ────────────────────────── */}
      {active.length === 0 ? (
        <Card>
          <CardContent className="flex h-40 flex-col items-center justify-center text-muted-foreground">
            <BedDouble className="mb-2 size-8" />
            <p>No hay pacientes internados actualmente.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((h) => (
            <HospCard key={h.id} hosp={h} onClick={() => setSelectedHosp(h)} />
          ))}
        </div>
      )}

      {/* ─── History ─────────────────────────────── */}
      {discharged.length > 0 && (
        <>
          <Separator />
          <h2 className="text-lg font-semibold">Historial</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {discharged.map((h) => (
              <HospCard
                key={h.id}
                hosp={h}
                onClick={() => setSelectedHosp(h)}
              />
            ))}
          </div>
        </>
      )}

      <AdmitDialog open={admitOpen} onOpenChange={setAdmitOpen} />
      <HospDetailSheet
        hosp={selectedHosp}
        onClose={() => setSelectedHosp(null)}
      />
    </div>
  );
}

// ─── Hospitalization Card ────────────────────────────────
function HospCard({
  hosp,
  onClick,
}: {
  hosp: Hospitalization;
  onClick: () => void;
}) {
  const days = daysSince(hosp.admittedAt);
  const lastNote = hosp.notes?.[0];

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <PawPrint className="size-5 text-primary" />
            <div>
              <CardTitle className="text-base">{hosp.patient?.name}</CardTitle>
              <CardDescription className="text-xs">
                {hosp.patient?.species}
                {hosp.patient?.breed ? ` · ${hosp.patient.breed}` : ""}
                {" — "}
                {hosp.patient?.client?.firstName}{" "}
                {hosp.patient?.client?.lastName ?? ""}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`${HOSP_STATUS_COLORS[hosp.status]} border-0 text-xs`}
          >
            {HOSP_STATUS_LABELS[hosp.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="line-clamp-1 text-sm">{hosp.reason}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="size-3" />
            {days} {days === 1 ? "día" : "días"}
          </div>
          {hosp.dailyRate && (
            <div className="flex items-center gap-1">
              <Receipt className="size-3" />
              {formatCurrency(hosp.dailyRate)}/día
            </div>
          )}
        </div>
        {lastNote && (
          <p className="line-clamp-1 text-xs text-muted-foreground italic">
            Última nota: {lastNote.observations}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Admit Dialog ────────────────────────────────────────
function AdmitDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const createMut = useCreateHospitalization();
  const { data: patientOpts } = usePatientOptions();
  const [patientId, setPatientId] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!patientId) return;
    const fd = new FormData(e.currentTarget);
    const payload: CreateHospitalizationPayload = {
      patientId,
      reason: (fd.get("reason") as string).trim(),
      diagnosis: (fd.get("diagnosis") as string).trim() || undefined,
      estimatedDays: Number(fd.get("estimatedDays")) || undefined,
      dailyRate: (fd.get("dailyRate") as string).trim() || undefined,
      weight: (fd.get("weight") as string).trim() || undefined,
      temperature: (fd.get("temperature") as string).trim() || undefined,
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[520px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ingresar Paciente</DialogTitle>
            <DialogDescription>
              Registra la admisión de un paciente al internado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Paciente</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {patientOpts?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.species}) — {p.client.firstName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admitReason">Motivo de Ingreso</Label>
              <Input id="admitReason" name="reason" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admitDiag">Diagnóstico Inicial</Label>
              <Textarea id="admitDiag" name="diagnosis" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="admitDays">Días Estimados</Label>
                <Input
                  id="admitDays"
                  name="estimatedDays"
                  type="number"
                  min={1}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admitRate">Tarifa Diaria (C$)</Label>
                <Input
                  id="admitRate"
                  name="dailyRate"
                  type="number"
                  step="0.01"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="admitWeight">Peso (kg)</Label>
                <Input
                  id="admitWeight"
                  name="weight"
                  type="number"
                  step="0.01"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admitTemp">Temperatura (°C)</Label>
                <Input
                  id="admitTemp"
                  name="temperature"
                  type="number"
                  step="0.1"
                />
              </div>
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
            <Button type="submit" disabled={createMut.isPending || !patientId}>
              {createMut.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Ingresar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Detail Sheet ────────────────────────────────────────
function HospDetailSheet({
  hosp,
  onClose,
}: {
  hosp: Hospitalization | null;
  onClose: () => void;
}) {
  const tenantKey = useTenantKey();
  const dischargeMut = useDischargeHospitalization();
  const addNoteMut = useAddHospNote();
  const addItemMut = useAddHospItem();
  const billMut = useGenerateHospBill();

  const [tab, setTab] = useState<"notes" | "items" | "discharge">("notes");
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  // Fetch full detail when sheet opens
  const { data: detail } = useQuery({
    queryKey: [...tenantKey, "hospitalizations", "detail", hosp?.id],
    queryFn: () => fetchHospitalization(hosp!.id),
    enabled: !!hosp,
  });

  if (!hosp) return null;
  const hospId = hosp.id;
  const isActive = hosp.status === "ACTIVE";
  const days = daysSince(hosp.admittedAt);
  const d = detail ?? hosp;

  function handleAddNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: AddNotePayload = {
      observations: (fd.get("observations") as string).trim(),
      treatment: (fd.get("treatment") as string).trim() || undefined,
      weight: (fd.get("noteWeight") as string).trim() || undefined,
      temperature: (fd.get("noteTemp") as string).trim() || undefined,
    };
    addNoteMut.mutate(
      { id: hospId, p: payload },
      { onSuccess: () => e.currentTarget?.reset() },
    );
  }

  function handleAddItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: AddItemPayload = {
      description: (fd.get("itemDesc") as string).trim(),
      quantity: Number(fd.get("itemQty")) || 1,
      unitPrice: (fd.get("itemPrice") as string).trim(),
    };
    addItemMut.mutate(
      { id: hospId, p: payload },
      { onSuccess: () => e.currentTarget?.reset() },
    );
  }

  function handleDischarge(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    dischargeMut.mutate(
      {
        id: hospId,
        notes: (fd.get("dischargeNotes") as string).trim() || undefined,
      },
      { onSuccess: onClose },
    );
  }

  // Calculate estimated total
  let estimatedTotal = 0;
  if (d.dailyRate) estimatedTotal += Number(d.dailyRate) * days;
  if (d.items) {
    for (const item of d.items) {
      estimatedTotal += Number(item.unitPrice) * item.quantity;
    }
  }

  return (
    <Sheet open={!!hosp} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="overflow-y-auto p-6 sm:max-w-[520px]">
        <SheetHeader className="pb-2">
          <SheetTitle className="flex items-center gap-2">
            <PawPrint className="size-5 text-primary" />
            {d.patient?.name}
          </SheetTitle>
          <SheetDescription>
            {d.reason} —{" "}
            <Badge
              variant="outline"
              className={`${HOSP_STATUS_COLORS[d.status as HospitalizationStatus]} border-0 text-xs`}
            >
              {HOSP_STATUS_LABELS[d.status as HospitalizationStatus]}
            </Badge>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-5">
          {/* ─── Summary ─────────────────────────── */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xl font-bold">{days}</p>
              <p className="text-xs text-muted-foreground">Días</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xl font-bold">
                {d.dailyRate ? formatCurrency(d.dailyRate) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Tarifa/día</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xl font-bold">
                {formatCurrency(estimatedTotal)}
              </p>
              <p className="text-xs text-muted-foreground">Total Est.</p>
            </div>
          </div>

          <Separator />

          {/* ─── Tab Nav ──────────────────────────── */}
          {isActive && (
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {(
                [
                  ["notes", "Notas", StickyNote],
                  ["items", "Cargos", Package],
                  ["discharge", "Alta", LogOut],
                ] as const
              ).map(([key, label, Icon]) => (
                <Button
                  key={key}
                  variant={tab === key ? "secondary" : "ghost"}
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setTab(key)}
                >
                  <Icon className="mr-1 size-3" />
                  {label}
                </Button>
              ))}
            </div>
          )}

          {/* ─── Add Note ─────────────────────────── */}
          {isActive && tab === "notes" && (
            <form onSubmit={handleAddNote} className="space-y-3">
              <h3 className="text-sm font-semibold">Nueva Nota de Progreso</h3>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  name="noteWeight"
                  placeholder="Peso (kg)"
                  type="number"
                  step="0.01"
                />
                <Input
                  name="noteTemp"
                  placeholder="Temp (°C)"
                  type="number"
                  step="0.1"
                />
              </div>
              <Textarea
                name="observations"
                placeholder="Observaciones..."
                rows={2}
                required
              />
              <Textarea
                name="treatment"
                placeholder="Tratamiento aplicado..."
                rows={2}
              />
              <Button type="submit" size="sm" disabled={addNoteMut.isPending}>
                {addNoteMut.isPending && (
                  <Loader2 className="mr-2 size-3 animate-spin" />
                )}
                Agregar Nota
              </Button>
            </form>
          )}

          {/* ─── Add Item ─────────────────────────── */}
          {isActive && tab === "items" && (
            <form onSubmit={handleAddItem} className="space-y-3">
              <h3 className="text-sm font-semibold">Agregar Cargo</h3>
              <Input name="itemDesc" placeholder="Descripción" required />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  name="itemQty"
                  placeholder="Cantidad"
                  type="number"
                  min={1}
                  defaultValue={1}
                />
                <Input
                  name="itemPrice"
                  placeholder="Precio unitario"
                  type="number"
                  step="0.01"
                  required
                />
              </div>
              <Button type="submit" size="sm" disabled={addItemMut.isPending}>
                {addItemMut.isPending && (
                  <Loader2 className="mr-2 size-3 animate-spin" />
                )}
                Agregar Cargo
              </Button>
            </form>
          )}

          {/* ─── Discharge ────────────────────────── */}
          {isActive && tab === "discharge" && (
            <form onSubmit={handleDischarge} className="space-y-3">
              <h3 className="text-sm font-semibold">Dar de Alta</h3>
              <Textarea
                name="dischargeNotes"
                placeholder="Notas de alta..."
                rows={3}
              />
              <Button type="submit" size="sm" disabled={dischargeMut.isPending}>
                {dischargeMut.isPending && (
                  <Loader2 className="mr-2 size-3 animate-spin" />
                )}
                Confirmar Alta
              </Button>
            </form>
          )}

          {/* ─── Generate Bill ────────────────────── */}
          {!d.saleId && estimatedTotal > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Generar Factura</h3>
                <div className="flex gap-3">
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Efectivo</SelectItem>
                      <SelectItem value="CARD">Tarjeta</SelectItem>
                      <SelectItem value="TRANSFER">Transferencia</SelectItem>
                      <SelectItem value="CREDIT">Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() =>
                      billMut.mutate({ id: hospId, paymentMethod })
                    }
                    disabled={billMut.isPending}
                  >
                    {billMut.isPending && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    <Receipt className="mr-2 size-4" />
                    Facturar {formatCurrency(estimatedTotal)}
                  </Button>
                </div>
              </div>
            </>
          )}

          {d.saleId && (
            <>
              <Separator />
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                <Receipt className="size-4" />
                Factura generada
              </div>
            </>
          )}

          {/* ─── Notes Timeline ───────────────────── */}
          {d.notes && d.notes.length > 0 && (
            <>
              <Separator />
              <h3 className="text-sm font-semibold">Notas de Progreso</h3>
              <div className="space-y-3">
                {d.notes.map((note) => (
                  <div key={note.id} className="rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {note.vet?.firstName} {note.vet?.lastName}
                      </span>
                      <span>
                        {new Date(note.createdAt).toLocaleString("es-NI", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {(note.weight || note.temperature) && (
                      <div className="mt-1 flex gap-3 text-xs">
                        {note.weight && (
                          <span className="flex items-center gap-1">
                            <Weight className="size-3" />
                            {note.weight} kg
                          </span>
                        )}
                        {note.temperature && (
                          <span className="flex items-center gap-1">
                            <Thermometer className="size-3" />
                            {note.temperature}°C
                          </span>
                        )}
                      </div>
                    )}
                    <p className="mt-1">{note.observations}</p>
                    {note.treatment && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Tratamiento: {note.treatment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── Items List ───────────────────────── */}
          {d.items && d.items.length > 0 && (
            <>
              <Separator />
              <h3 className="text-sm font-semibold">Cargos Adicionales</h3>
              <div className="space-y-2">
                {d.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-2 text-sm"
                  >
                    <span>{item.description}</span>
                    <span className="font-medium">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
