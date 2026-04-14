import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getTenantKey } from "@/lib/query/tenant-key";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/features/categories/hooks/useCategories";
import type { Category } from "@/features/categories/types/category.types";
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
import { categoriesQueryOptions } from "@/features/categories/api/categories.queries";

export const Route = createFileRoute("/_auth/_appLayout/categories")({
  component: CategoriesPage,
  loader: async ({ context: { queryClient } }) => {
    const tenantKey = getTenantKey();
    await queryClient.ensureQueryData(categoriesQueryOptions(tenantKey));
  },
});

function CategoriesPage() {
  const [page, setPage] = useState(1);
  const { data } = useCategories(page);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );

  function openCreateDialog() {
    setEditingCategory(null);
    setDialogOpen(true);
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground">
            Administra las categorías de productos.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 size-4" />
          Nueva Categoría
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="w-[70px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-24 text-center text-muted-foreground"
                >
                  No hay categorías registradas.
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  onEdit={openEditDialog}
                  onDelete={setDeletingCategory}
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

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
      />

      <CategoryDeleteConfirm
        category={deletingCategory}
        onClose={() => setDeletingCategory(null)}
      />
    </div>
  );
}

function CategoryRow({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{category.name}</TableCell>
      <TableCell className="text-muted-foreground">
        {category.description || "—"}
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
            <DropdownMenuItem onClick={() => onEdit(category)}>
              <Pencil className="mr-2 size-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(category)}
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

function CategoryDeleteConfirm({
  category,
  onClose,
}: {
  category: Category | null;
  onClose: () => void;
}) {
  const deleteMutation = useDeleteCategory();

  return (
    <ConfirmDeleteDialog
      open={category !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onConfirm={() => {
        if (category) {
          deleteMutation.mutate(category.id, { onSuccess: onClose });
        }
      }}
      isPending={deleteMutation.isPending}
      description={`La categoría "${category?.name}" será eliminada permanentemente.`}
    />
  );
}

function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}) {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const isEditing = category !== null;
  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || undefined;

    if (isEditing) {
      updateMutation.mutate(
        { id: category.id, payload: { name, description } },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(
        { name, description },
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
              {isEditing ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifica los datos de la categoría."
                : "Registra una nueva categoría de productos."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ej: Antibióticos"
                defaultValue={category?.name ?? ""}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input
                id="description"
                name="description"
                placeholder="Breve descripción de la categoría"
                defaultValue={category?.description ?? ""}
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
              {isEditing ? "Guardar Cambios" : "Crear Categoría"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}