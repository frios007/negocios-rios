import type { Sale } from "../types/sale.types";
import { useVoidSale } from "../hooks/useSales";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";

interface VoidSaleConfirmProps {
  sale: Sale | null;
  onClose: () => void;
}

export function VoidSaleConfirm({ sale, onClose }: VoidSaleConfirmProps) {
  const voidMutation = useVoidSale();
  return (
    <ConfirmDeleteDialog
      open={sale !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onConfirm={() => {
        if (sale) {
          voidMutation.mutate(sale.id, { onSuccess: onClose });
        }
      }}
      isPending={voidMutation.isPending}
      title="¿Anular esta venta?"
      description={`La venta por C$ ${Number(sale?.totalAmount ?? 0).toFixed(2)} será anulada. El inventario se restaurará para productos físicos.`}
    />
  );
}
