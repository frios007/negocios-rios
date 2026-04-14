import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getTenantKey } from "@/lib/query/tenant-key";
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from "@/features/suppliers/hooks/useSuppliers";
import type { Supplier } from "@/features/suppliers/types/supplier.types";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { suppliersQueryOptions } from "@/features/suppliers/api/suppliers.queries";

export const Route = createFileRoute("/_auth/_appLayout/suppliers")({
  component: SuppliersPage,
  loader: async ({ context: { queryClient } }) => {
    const tenantKey = getTenantKey();
    await queryClient.ensureQueryData(suppliersQueryOptions(tenantKey));
  },
});

function SuppliersPage() {
  const [page, setPage] = useState(1);
  const { data } = useSuppliers(page);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(
    null,
  );

  function openCreateDialog() {
    setEditingSupplier(null);
    setDialogOpen(true);
  }

  function openEditDialog(supplier: Supplier) {
    setEditingSupplier(supplier);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proveedores</h1>
          <p className="text-muted-foreground">
            Administra los proveedores de productos.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 size-4" />
          Nuevo Proveedor
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[70px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No hay proveedores registrados.
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((supplier) => (
                <SupplierRow
                  key={supplier.id}
                  supplier={supplier}
                  onEdit={openEditDialog}
                  onDelete={setDeletingSupplier}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {data.meta.page} de {data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}

      <SupplierFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        supplier={editingSupplier}
      />

      <SupplierDeleteConfirm
        supplier={deletingSupplier}
        onClose={() => setDeletingSupplier(null)}
      />
    </div>
  );
}

function SupplierRow({
  supplier,
  onEdit,
  onDelete,
}: {
  supplier: Supplier;
  onEdit: (s: Supplier) => void;
  onDelete: (s: Supplier) => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{supplier.name}</TableCell>
      <TableCell>{supplier.phoneNumber || "—"}</TableCell>
      <TableCell className="text-muted-foreground">
        {supplier.email || "—"}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Acciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(supplier)}>
              <Pencil className="mr-2 size-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(supplier)}
            >
              <Trash2 className="mr-2 size-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function SupplierDeleteConfirm({
  supplier,
  onClose,
}: {
  supplier: Supplier | null;
  onClose: () => void;
}) {
  const deleteMutation = useDeleteSupplier();

  return (
    <ConfirmDeleteDialog
      open={supplier !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onConfirm={() => {
        if (supplier) {
          deleteMutation.mutate(supplier.id, { onSuccess: onClose });
        }
      }}
      isPending={deleteMutation.isPending}
      description={`El proveedor "${supplier?.name}" será eliminado permanentemente.`}
    />
  );
}

function SupplierFormDialog({
  open,
  onOpenChange,
  supplier,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
}) {
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const isEditing = supplier !== null;
  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phoneNumber = (formData.get("phoneNumber") as string) || undefined;
    const email = (formData.get("email") as string) || undefined;

    if (isEditing) {
      updateMutation.mutate(
        { id: supplier.id, payload: { name, phoneNumber, email } },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(
        { name, phoneNumber, email },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Proveedor" : "Nuevo Proveedor"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifica los datos del proveedor."
                : "Registra un nuevo proveedor de productos."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ej: Distribuidora Nacional"
                defaultValue={supplier?.name ?? ""}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Teléfono (opcional)</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="Ej: 2234-5678"
                defaultValue={supplier?.phoneNumber ?? ""}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Ej: contacto@proveedor.com"
                defaultValue={supplier?.email ?? ""}
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
              {isEditing ? "Guardar Cambios" : "Crear Proveedor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
