import { useRecordMovement, useProductOptions } from "../hooks/useStockMovements";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface MovementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovementFormDialog({
  open,
  onOpenChange,
}: MovementFormDialogProps) {
  const recordMutation = useRecordMovement();
  const { data: products } = useProductOptions();
  const isPending = recordMutation.isPending;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      productId: fd.get("productId") as string,
      type: fd.get("type") as
        | "PURCHASE_IN"
        | "ADJUSTMENT_IN"
        | "ADJUSTMENT_OUT",
      quantity: parseInt(fd.get("quantity") as string, 10),
      batchNumber: (fd.get("batchNumber") as string) || undefined,
      expirationDate: (fd.get("expirationDate") as string) || undefined,
      notes: (fd.get("notes") as string) || undefined,
    };

    recordMutation.mutate(payload, {
      onSuccess: () => onOpenChange(false),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Registrar Movimiento</DialogTitle>
            <DialogDescription>
              Ingresa los datos del movimiento de inventario.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Producto</Label>
              <Select name="productId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto..." />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tipo de movimiento</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PURCHASE_IN">Compra</SelectItem>
                    <SelectItem value="ADJUSTMENT_IN">
                      Ajuste entrada
                    </SelectItem>
                    <SelectItem value="ADJUSTMENT_OUT">
                      Ajuste salida
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mf-quantity">Cantidad</Label>
                <Input
                  id="mf-quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="mf-batchNumber">Número de lote</Label>
                <Input
                  id="mf-batchNumber"
                  name="batchNumber"
                  placeholder="Opcional"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mf-expirationDate">Fecha de vencimiento</Label>
                <Input
                  id="mf-expirationDate"
                  name="expirationDate"
                  type="date"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mf-notes">Notas</Label>
              <Input
                id="mf-notes"
                name="notes"
                placeholder="Descripción del movimiento (opcional)"
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
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Registrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
