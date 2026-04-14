import { useState } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useBusinessContext } from "@/features/auth/hooks/useBusinessContext";
import { updateProfileApi } from "@/features/auth/api/auth.api";
import { ROLE_LABELS } from "@/features/users/types/user.types";
import type { UserRole } from "@/features/users/types/user.types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Phone,
  AtSign,
  Building2,
  Calendar,
  Loader2,
  Pencil,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSheet({ open, onOpenChange }: Props) {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const businessUnits = useAuthStore((s) => s.businessUnits);
  const { activeBU, activeRole, businessUnits: buList } = useBusinessContext();

  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);

  if (!user) return null;

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const firstName = (fd.get("firstName") as string).trim();
    const lastName = (fd.get("lastName") as string).trim();
    const phoneNumber = (fd.get("phoneNumber") as string).trim() || undefined;

    setIsPending(true);
    try {
      const updated = await updateProfileApi({ firstName, lastName, phoneNumber });
      // Update auth store with the new profile data
      setAuth(
        { ...user, firstName: updated.firstName, lastName: updated.lastName },
        accessToken!,
        businessUnits,
      );
      toast.success("Perfil actualizado correctamente");
      setIsEditing(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Error al actualizar el perfil";
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setIsEditing(false); }}>
      <SheetContent className="overflow-y-auto p-6 sm:max-w-[480px]">
        <SheetHeader className="pb-2">
          <SheetTitle className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {initials}
            </div>
            <div>
              <p className="text-lg">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm font-normal text-muted-foreground">
                @{user.username}
              </p>
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Tu perfil de usuario
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-6">
          {/* ─── Profile Info / Edit Form ──────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Información Personal
              </h3>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-7 text-xs"
                >
                  <Pencil className="mr-1 size-3" />
                  Editar
                </Button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="profileFirstName" className="text-xs">
                      Nombre
                    </Label>
                    <Input
                      id="profileFirstName"
                      name="firstName"
                      defaultValue={user.firstName}
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="profileLastName" className="text-xs">
                      Apellido
                    </Label>
                    <Input
                      id="profileLastName"
                      name="lastName"
                      defaultValue={user.lastName}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="profilePhone" className="text-xs">
                    Teléfono
                  </Label>
                  <Input
                    id="profilePhone"
                    name="phoneNumber"
                    placeholder="Ej: 8888-1234"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={isPending}>
                    {isPending && (
                      <Loader2 className="mr-1 size-3 animate-spin" />
                    )}
                    Guardar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="mr-1 size-3" />
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm">
                  <User className="size-4 text-muted-foreground" />
                  <span>
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <AtSign className="size-4 text-muted-foreground" />
                  <span>{user.username}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground italic">
                    No disponible en esta vista
                  </span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* ─── Current Role & BU ──────────────────────── */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Acceso Actual
            </h3>
            {activeBU && (
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {activeBU.businessUnit?.name ?? "—"}
                  </span>
                </div>
                <div className="mt-1.5">
                  <Badge variant="outline" className="border-0 text-xs">
                    {ROLE_LABELS[(activeRole as UserRole) ?? "CASHIER"]}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* ─── All BU Assignments ──────────────────────── */}
          {buList.length > 1 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Todos los Negocios
                </h3>
                <div className="space-y-2">
                  {buList.map((bu) => (
                    <div
                      key={bu.businessUnitId}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-muted-foreground" />
                        <span className="text-sm">
                          {bu.businessUnit?.name ?? bu.businessUnitId}
                        </span>
                      </div>
                      <Badge variant="outline" className="border-0 text-xs">
                        {ROLE_LABELS[bu.role as UserRole]}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
