import { useState } from "react";
import type { ManagedUser, UserRole } from "../types/user.types";
import { ROLE_LABELS } from "../types/user.types";
import { useCreateUser, useUpdateUser } from "../hooks/useUsers";
import { useBusinessContext } from "@/features/auth/hooks/useBusinessContext";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ManagedUser | null; // null = create mode
}

const ALL_ROLES: UserRole[] = ["OWNER", "ADMIN", "VET", "PHARMACIST", "CASHIER"];

export function UserFormDialog({ open, onOpenChange, user }: Props) {
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const { activeRole } = useBusinessContext();
  const isEditing = user !== null;
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Filter roles based on acting user's role
  const availableRoles = ALL_ROLES.filter((role) => {
    if (activeRole === "OWNER") return true;
    // ADMIN cannot assign OWNER
    return role !== "OWNER";
  });

  const [role, setRole] = useState<UserRole>(user?.role ?? "CASHIER");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const firstName = (fd.get("firstName") as string).trim();
    const lastName = (fd.get("lastName") as string).trim();
    const phoneNumber = (fd.get("phoneNumber") as string).trim() || undefined;

    if (isEditing) {
      updateMutation.mutate(
        { id: user.id, payload: { firstName, lastName, phoneNumber } },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      const username = (fd.get("username") as string).trim();
      const password = (fd.get("password") as string);
      createMutation.mutate(
        { username, firstName, lastName, phoneNumber, password, role },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifica los datos del usuario."
                : "Crea un nuevo usuario y asígnalo a este negocio."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {!isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Ej: juan.perez"
                  required
                  minLength={3}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Ej: Juan"
                  defaultValue={user?.firstName ?? ""}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Ej: Pérez"
                  defaultValue={user?.lastName ?? ""}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Teléfono (opcional)</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="Ej: 8888-1234"
                defaultValue={user?.phoneNumber ?? ""}
              />
            </div>

            {!isEditing && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Rol</Label>
                  <Select
                    value={role}
                    onValueChange={(v) => setRole(v as UserRole)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
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
              {isEditing ? "Guardar Cambios" : "Crear Usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
