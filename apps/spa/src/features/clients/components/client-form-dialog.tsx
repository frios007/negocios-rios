import type { Client } from "../types/client.types";
import { useCreateClient, useUpdateClient } from "../hooks/useClients";
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
import { Loader2 } from "lucide-react";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
}

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
}: ClientFormDialogProps) {
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const isEditing = client !== null;
  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      firstName: fd.get("firstName") as string,
      lastName: (fd.get("lastName") as string) || undefined,
      documentId: (fd.get("documentId") as string) || undefined,
      phoneNumber: (fd.get("phoneNumber") as string) || undefined,
      creditLimit: parseFloat(fd.get("creditLimit") as string) || 0,
    };

    if (isEditing) {
      updateMutation.mutate(
        { id: client.id, payload },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifica los datos del cliente."
                : "Registra un nuevo cliente."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cf-firstName">Nombre</Label>
                <Input
                  id="cf-firstName"
                  name="firstName"
                  placeholder="Nombre"
                  defaultValue={client?.firstName ?? ""}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cf-lastName">Apellido</Label>
                <Input
                  id="cf-lastName"
                  name="lastName"
                  placeholder="Apellido"
                  defaultValue={client?.lastName ?? ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cf-phoneNumber">Teléfono</Label>
                <Input
                  id="cf-phoneNumber"
                  name="phoneNumber"
                  placeholder="8888-8888"
                  defaultValue={client?.phoneNumber ?? ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cf-documentId">Documento / Cédula</Label>
                <Input
                  id="cf-documentId"
                  name="documentId"
                  placeholder="Opcional"
                  defaultValue={client?.documentId ?? ""}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cf-creditLimit">Límite de crédito (C$)</Label>
              <Input
                id="cf-creditLimit"
                name="creditLimit"
                type="number"
                step="0.01"
                min="0"
                max="99999999.99"
                placeholder="0.00"
                defaultValue={client?.creditLimit ?? "0"}
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
              {isEditing ? "Guardar Cambios" : "Registrar Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
