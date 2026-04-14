import { useState } from "react";
import type { ManagedUser, UserRole } from "../types/user.types";
import { ROLE_LABELS, ROLE_COLORS } from "../types/user.types";
import { useUpdateUserRole } from "../hooks/useUsers";
import { useBusinessContext } from "@/features/auth/hooks/useBusinessContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ManagedUser | null;
}

const ALL_ROLES: UserRole[] = ["OWNER", "ADMIN", "VET", "PHARMACIST", "CASHIER"];

export function UserRoleDialog({ open, onOpenChange, user }: Props) {
  const mutation = useUpdateUserRole();
  const { activeRole } = useBusinessContext();
  const [newRole, setNewRole] = useState<UserRole>(user?.role ?? "CASHIER");

  const availableRoles = ALL_ROLES.filter((role) => {
    if (activeRole === "OWNER") return true;
    return role !== "OWNER";
  });

  if (!user) return null;

  function handleSubmit() {
    if (!user || newRole === user.role) return;
    mutation.mutate(
      { id: user.id, role: newRole },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Cambiar Rol</DialogTitle>
          <DialogDescription>
            Cambia el rol de{" "}
            <span className="font-medium">
              {user.firstName} {user.lastName}
            </span>{" "}
            en este negocio.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-3 py-6">
          <Badge
            variant="outline"
            className={`${ROLE_COLORS[user.role]} border-0 px-3 py-1 text-sm`}
          >
            {ROLE_LABELS[user.role]}
          </Badge>
          <ArrowRight className="size-4 text-muted-foreground" />
          <Badge
            variant="outline"
            className={`${ROLE_COLORS[newRole]} border-0 px-3 py-1 text-sm`}
          >
            {ROLE_LABELS[newRole]}
          </Badge>
        </div>

        <div className="grid gap-2">
          <Select
            value={newRole}
            onValueChange={(v) => setNewRole(v as UserRole)}
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

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={mutation.isPending || newRole === user.role}
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Cambiar Rol
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
