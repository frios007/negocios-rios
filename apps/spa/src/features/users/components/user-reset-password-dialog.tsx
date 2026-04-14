import { useState } from "react";
import type { ManagedUser } from "../types/user.types";
import { useResetUserPassword } from "../hooks/useUsers";
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
import { Loader2, Eye, EyeOff } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ManagedUser | null;
}

export function UserResetPasswordDialog({ open, onOpenChange, user }: Props) {
  const mutation = useResetUserPassword();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!user) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || password.length < 6) return;
    mutation.mutate(
      { id: user.id, newPassword: password },
      {
        onSuccess: () => {
          setPassword("");
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setPassword("");
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-[420px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Restablecer Contraseña</DialogTitle>
            <DialogDescription>
              Establece una nueva contraseña para{" "}
              <span className="font-medium">
                {user.firstName} {user.lastName}
              </span>
              . La sesión activa del usuario será cerrada.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
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
            <Button
              type="submit"
              disabled={mutation.isPending || password.length < 6}
            >
              {mutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Restablecer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
