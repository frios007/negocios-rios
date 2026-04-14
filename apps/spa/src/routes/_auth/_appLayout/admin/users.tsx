import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getTenantKey } from "@/lib/query/tenant-key";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useUsers, useToggleUserStatus } from "@/features/users/hooks/useUsers";
import type { ManagedUser } from "@/features/users/types/user.types";
import { ROLE_LABELS } from "@/features/users/types/user.types";
import { getUserColumns } from "@/features/users/components/user-columns";
import { UserFormDialog } from "@/features/users/components/user-form-dialog";
import { UserRoleDialog } from "@/features/users/components/user-role-dialog";
import { UserResetPasswordDialog } from "@/features/users/components/user-reset-password-dialog";
import { UserDetailSheet } from "@/features/users/components/user-detail-sheet";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { usersQueryOptions } from "@/features/users/api/users.queries";

export const Route = createFileRoute("/_auth/_appLayout/admin/users")({
  component: UsersPage,
  loader: async ({ context: { queryClient } }) => {
    const tenantKey = getTenantKey();
    await queryClient.ensureQueryData(usersQueryOptions(tenantKey));
  },
});

function UsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const { data } = useUsers();
  const toggleMutation = useToggleUserStatus();

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [roleUser, setRoleUser] = useState<ManagedUser | null>(null);
  const [passwordUser, setPasswordUser] = useState<ManagedUser | null>(null);
  const [detailUser, setDetailUser] = useState<ManagedUser | null>(null);
  const [togglingUser, setTogglingUser] = useState<ManagedUser | null>(null);

  const columns = useMemo(
    () =>
      getUserColumns({
        currentUserId: currentUser?.id ?? "",
        onEdit: (u) => {
          setEditingUser(u);
          setFormOpen(true);
        },
        onChangeRole: setRoleUser,
        onResetPassword: setPasswordUser,
        onToggleStatus: setTogglingUser,
      }),
    [currentUser?.id],
  );

  const facetedFilters = useMemo(
    () => [
      {
        columnId: "role",
        label: "Rol",
        options: Object.entries(ROLE_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
      },
      {
        columnId: "status",
        label: "Estado",
        options: [
          { value: "active", label: "Activo" },
          { value: "inactive", label: "Inactivo" },
        ],
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">
            Gestión de cuentas de usuario y accesos.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingUser(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          Nuevo Usuario
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        onRowClick={setDetailUser}
        renderToolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchColumnId="fullName"
            searchPlaceholder="Buscar por nombre..."
            facetedFilters={facetedFilters}
          />
        )}
      />

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editingUser}
      />

      <UserRoleDialog
        open={!!roleUser}
        onOpenChange={(open) => !open && setRoleUser(null)}
        user={roleUser}
      />

      <UserResetPasswordDialog
        open={!!passwordUser}
        onOpenChange={(open) => !open && setPasswordUser(null)}
        user={passwordUser}
      />

      <UserDetailSheet
        open={!!detailUser}
        onOpenChange={(open) => !open && setDetailUser(null)}
        user={detailUser}
      />

      <ConfirmDeleteDialog
        open={!!togglingUser}
        onOpenChange={(open) => !open && setTogglingUser(null)}
        title={
          togglingUser?.isActive
            ? "Desactivar Usuario"
            : "Activar Usuario"
        }
        description={
          togglingUser?.isActive
            ? `¿Estás seguro de desactivar a ${togglingUser?.firstName} ${togglingUser?.lastName}? Su sesión será cerrada inmediatamente.`
            : `¿Reactivar la cuenta de ${togglingUser?.firstName} ${togglingUser?.lastName}?`
        }
        confirmLabel={togglingUser?.isActive ? "Desactivar" : "Activar"}
        variant={togglingUser?.isActive ? "destructive" : "default"}
        isPending={toggleMutation.isPending}
        onConfirm={() => {
          if (!togglingUser) return;
          toggleMutation.mutate(togglingUser.id, {
            onSuccess: () => setTogglingUser(null),
          });
        }}
      />
    </div>
  );
}
