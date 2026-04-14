import { useState } from "react";
import type { Product } from "../types/product.types";
import {
  useCreateProduct,
  useUpdateProduct,
  useCategoryOptions,
  useSupplierOptions,
} from "../hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: ProductFormDialogProps) {
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const { data: categories } = useCategoryOptions();
  const { data: suppliers } = useSupplierOptions();
  const isEditing = product !== null;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [costPrice, setCostPrice] = useState("");
  const [profitMargin, setProfitMargin] = useState("");

  const cost = parseFloat(costPrice) || 0;
  const margin = parseFloat(profitMargin) || 0;
  const sellingPrice = cost * (1 + margin / 100);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen && product) {
      setCostPrice(product.costPrice);
      setProfitMargin(Number(product.profitMargin).toFixed(0));
    } else if (nextOpen) {
      setCostPrice("");
      setProfitMargin("");
    }
    onOpenChange(nextOpen);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      barcode: (fd.get("barcode") as string) || undefined,
      description: (fd.get("description") as string) || undefined,
      categoryId: (fd.get("categoryId") as string) || undefined,
      supplierId: (fd.get("supplierId") as string) || undefined,
      costPrice: parseFloat(fd.get("costPrice") as string),
      profitMargin: parseFloat(fd.get("profitMargin") as string),
      isRegulated: fd.get("isRegulated") === "on",
      isSample: fd.get("isSample") === "on",
    };

    if (isEditing) {
      updateMutation.mutate(
        { id: product.id, payload },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifica los datos del producto."
                : "Registra un nuevo producto en el catálogo."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="pf-name">Nombre</Label>
                <Input
                  id="pf-name"
                  name="name"
                  placeholder="Ej: Paracetamol 500mg"
                  defaultValue={product?.name ?? ""}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pf-barcode">Código de barras</Label>
                <Input
                  id="pf-barcode"
                  name="barcode"
                  placeholder="Opcional"
                  defaultValue={product?.barcode ?? ""}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pf-description">Descripción</Label>
              <Input
                id="pf-description"
                name="description"
                placeholder="Breve descripción del producto"
                defaultValue={product?.description ?? ""}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Categoría</Label>
                <Select
                  name="categoryId"
                  defaultValue={product?.category?.id ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Proveedor</Label>
                <Select
                  name="supplierId"
                  defaultValue={product?.supplier?.id ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ─── Pricing with Live Preview ─── */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="pf-costPrice">Precio de costo</Label>
                <Input
                  id="pf-costPrice"
                  name="costPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pf-profitMargin">Margen (%)</Label>
                <Input
                  id="pf-profitMargin"
                  name="profitMargin"
                  type="number"
                  step="1"
                  min="0"
                  max="999"
                  placeholder="0"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-muted-foreground">Precio de venta</Label>
                <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm font-medium tabular-nums">
                  C$ {sellingPrice.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pf-isRegulated"
                  name="isRegulated"
                  defaultChecked={product?.isRegulated ?? false}
                />
                <Label htmlFor="pf-isRegulated" className="text-sm font-normal">
                  Regulado
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pf-isSample"
                  name="isSample"
                  defaultChecked={product?.isSample ?? false}
                />
                <Label htmlFor="pf-isSample" className="text-sm font-normal">
                  Muestra médica
                </Label>
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
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? "Guardar Cambios" : "Crear Producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
