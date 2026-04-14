import type { Client } from "../types/client.types";
import { useDeleteClient } from "../hooks/useClients";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";

interface ClientDeleteConfirmProps {
  client: Client | null;
  onClose: () => void;
}

export function ClientDeleteConfirm({
  client,
  onClose,
}: ClientDeleteConfirmProps) {
  const deleteMutation = useDeleteClient();
  return (
    <ConfirmDeleteDialog
      open={client !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onConfirm={() => {
        if (client) {
          deleteMutation.mutate(client.id, { onSuccess: onClose });
        }
      }}
      isPending={deleteMutation.isPending}
      title="¿Desactivar cliente?"
      description={`El cliente "${client?.firstName}${client?.lastName ? ` ${client.lastName}` : ""}" será desactivado.`}
    />
  );
}
