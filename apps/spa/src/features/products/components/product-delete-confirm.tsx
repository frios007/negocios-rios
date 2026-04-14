import type { Product } from "../types/product.types";
import { useDeleteProduct } from "../hooks/useProducts";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";

interface ProductDeleteConfirmProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductDeleteConfirm({
  product,
  onClose,
}: ProductDeleteConfirmProps) {
  const deleteMutation = useDeleteProduct();
  return (
    <ConfirmDeleteDialog
      open={product !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onConfirm={() => {
        if (product) {
          deleteMutation.mutate(product.id, { onSuccess: onClose });
        }
      }}
      isPending={deleteMutation.isPending}
      title="¿Desactivar producto?"
      description={`El producto "${product?.name}" será desactivado. No se eliminará permanentemente.`}
    />
  );
}
