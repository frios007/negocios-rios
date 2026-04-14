import type { StockMovement, MovementType } from "../types/stock-movement.types";
import { MOVEMENT_TYPE_LABELS } from "../types/stock-movement.types";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const TYPE_BADGE_STYLES: Record<MovementType, string> = {
  PURCHASE_IN: "border-green-500 text-green-600",
  SALE_OUT: "border-red-500 text-red-600",
  ADJUSTMENT_IN: "border-blue-500 text-blue-600",
  ADJUSTMENT_OUT: "border-yellow-500 text-yellow-600",
};

interface MovementDetailSheetProps {
  movement: StockMovement | null;
  onClose: () => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm">{children}</span>
    </div>
  );
}

export function MovementDetailSheet({
  movement,
  onClose,
}: MovementDetailSheetProps) {
  return (
    <Sheet
      open={movement !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Detalle del Movimiento</SheetTitle>
          <SheetDescription>
            Información completa del movimiento de inventario.
          </SheetDescription>
        </SheetHeader>

        {movement && (
          <div className="px-6 pb-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Producto">
                <span className="font-medium">{movement.product.name}</span>
              </Field>
              <Field label="Tipo">
                <Badge
                  variant="outline"
                  className={TYPE_BADGE_STYLES[movement.type]}
                >
                  {MOVEMENT_TYPE_LABELS[movement.type]}
                </Badge>
              </Field>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <Field label="Cantidad">
                <span
                  className={`font-medium tabular-nums ${
                    movement.quantity > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {movement.quantity > 0 ? "+" : ""}
                  {movement.quantity}
                </span>
              </Field>
              <Field label="Número de lote">
                {movement.batchNumber || "—"}
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Fecha de vencimiento">
                {movement.expirationDate
                  ? new Date(movement.expirationDate).toLocaleDateString("es-NI")
                  : "—"}
              </Field>
              <Field label="Fecha de registro">
                {new Date(movement.createdAt).toLocaleDateString("es-NI", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Field>
            </div>

            <Separator />

            <Field label="Registrado por">
              {movement.user.firstName} {movement.user.lastName} (@
              {movement.user.username})
            </Field>

            <Field label="Notas">
              <span className="whitespace-pre-wrap">
                {movement.notes || "Sin notas."}
              </span>
            </Field>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
