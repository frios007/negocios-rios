import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ManagedUser, ManagedUserDetail, UserRole } from "../types/user.types";
import { ROLE_LABELS, ROLE_COLORS } from "../types/user.types";
import { fetchUser } from "../api/users.api";
import { useAssignUserToBU, useUnassignUserFromBU } from "../hooks/useUsers";
import { useBusinessContext } from "@/features/auth/hooks/useBusinessContext";
import { useTenantKey } from "@/lib/query/tenant-key";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Plus,
  Trash2,
  Loader2,
  Phone,
  User,
  Calendar,
} from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ManagedUser | null;
}

const ALL_ROLES: UserRole[] = ["OWNER", "ADMIN", "VET", "PHARMACIST", "CASHIER"];

export function UserDetailSheet({ open, onOpenChange, user }: Props) {
  const tenantKey = useTenantKey();
  const { activeRole, businessUnits: actingUserBUs } = useBusinessContext();
  const assignMutation = useAssignUserToBU();
  const unassignMutation = useUnassignUserFromBU();

  const [assignBU, setAssignBU] = useState("");
  const [assignRole, setAssignRole] = useState<UserRole>("CASHIER");

  // Fetch full detail (with BU assignments) when sheet opens
  const { data: detail, isLoading } = useQuery<ManagedUserDetail>({
    queryKey: [...tenantKey, "users", "detail", user?.id],
    queryFn: () => fetchUser(user!.id),
    enabled: open && !!user,
  });

  if (!user) return null;

  const availableRoles = ALL_ROLES.filter((role) => {
    if (activeRole === "OWNER") return true;
    return role !== "OWNER";
  });

  // BUs the user is NOT yet assigned to (from acting user's BUs they own)
  const assignableBUs = actingUserBUs
    .filter((bu) => bu.role === "OWNER") // Only OWNER can assign to BUs
    .filter(
      (bu) =>
        !detail?.businessUnits.some(
          (ub) => ub.businessUnitId === bu.businessUnitId,
        ),
    );

  function handleAssign() {
    if (!user || !assignBU) return;
    assignMutation.mutate(
      { id: user.id, payload: { businessUnitId: assignBU, role: assignRole } },
      {
        onSuccess: () => {
          setAssignBU("");
          setAssignRole("CASHIER");
        },
      },
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto p-6 sm:max-w-[480px]">
        <SheetHeader className="pb-2">
          <SheetTitle className="flex items-center gap-3">
            <div
              className={`flex size-10 items-center justify-center rounded-full text-sm font-semibold ${ROLE_COLORS[user.role]}`}
            >
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div>
              <p>
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm font-normal text-muted-foreground">
                @{user.username}
              </p>
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Detalle del usuario
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-6">
          {/* ─── Profile Info ────────────────────────── */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Información
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="size-4 text-muted-foreground" />
                <span>{user.firstName} {user.lastName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-muted-foreground" />
                <span>{user.phoneNumber || "Sin teléfono"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-4 text-muted-foreground" />
                <span>
                  Creado{" "}
                  {new Date(user.createdAt).toLocaleDateString("es-NI", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`size-2 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-red-500"}`}
                />
                <span>
                  {user.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* ─── Business Unit Assignments ────────────── */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Negocios Asignados
            </h3>

            {isLoading ? (
              <div className="flex h-20 items-center justify-center">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : detail?.businessUnits.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin asignaciones.
              </p>
            ) : (
              <div className="space-y-2">
                {detail?.businessUnits.map((ub) => (
                  <div
                    key={ub.businessUnitId}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {ub.businessUnit.name}
                        </p>
                        <Badge
                          variant="outline"
                          className={`${ROLE_COLORS[ub.role]} mt-1 border-0 text-xs`}
                        >
                          {ROLE_LABELS[ub.role]}
                        </Badge>
                      </div>
                    </div>
                    {activeRole === "OWNER" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() =>
                          unassignMutation.mutate({
                            userId: user.id,
                            buId: ub.businessUnitId,
                          })
                        }
                        disabled={unassignMutation.isPending}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─── Assign to New BU ────────────────────── */}
          {activeRole === "OWNER" && assignableBUs.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Asignar a Negocio
                </h3>
                <div className="space-y-3">
                  <Select value={assignBU} onValueChange={setAssignBU}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar negocio..." />
                    </SelectTrigger>
                    <SelectContent>
                      {assignableBUs.map((bu) => (
                        <SelectItem
                          key={bu.businessUnitId}
                          value={bu.businessUnitId}
                        >
                          {bu.businessUnit?.name ?? bu.businessUnitId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={assignRole}
                    onValueChange={(v) => setAssignRole(v as UserRole)}
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

                  <Button
                    onClick={handleAssign}
                    disabled={!assignBU || assignMutation.isPending}
                    className="w-full"
                  >
                    {assignMutation.isPending ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 size-4" />
                    )}
                    Asignar
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
