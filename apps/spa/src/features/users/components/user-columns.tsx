import type { ColumnDef } from "@tanstack/react-table";
import type { ManagedUser, UserRole } from "../types/user.types";
import { ROLE_LABELS, ROLE_COLORS } from "../types/user.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Shield, KeyRound, Power } from "lucide-react";

interface ColumnActions {
  onEdit: (user: ManagedUser) => void;
  onChangeRole: (user: ManagedUser) => void;
  onResetPassword: (user: ManagedUser) => void;
  onToggleStatus: (user: ManagedUser) => void;
  currentUserId: string;
}

export function getUserColumns(actions: ColumnActions): ColumnDef<ManagedUser>[] {
  return [
    {
      id: "avatar",
      header: "",
      cell: ({ row }) => {
        const u = row.original;
        const initials = `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
        const colorClass = ROLE_COLORS[u.role] || "bg-slate-100 text-slate-800";
        return (
          <div
            className={`flex size-9 items-center justify-center rounded-full text-xs font-semibold ${colorClass}`}
          >
            {initials}
          </div>
        );
      },
      size: 50,
    },
    {
      id: "fullName",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      header: "Nombre Completo",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div>
            <p className="font-medium">{u.firstName} {u.lastName}</p>
            <p className="text-xs text-muted-foreground">@{u.username}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "phoneNumber",
      header: "Teléfono",
      cell: ({ getValue }) => getValue() || "—",
    },
    {
      accessorKey: "role",
      header: "Rol",
      cell: ({ getValue }) => {
        const role = getValue() as UserRole;
        return (
          <Badge variant="outline" className={`${ROLE_COLORS[role]} border-0 text-xs`}>
            {ROLE_LABELS[role]}
          </Badge>
        );
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      id: "status",
      accessorKey: "isActive",
      header: "Estado",
      cell: ({ getValue }) => {
        const active = getValue() as boolean;
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`size-2 rounded-full ${active ? "bg-emerald-500" : "bg-red-500"}`}
            />
            <span className="text-sm">
              {active ? "Activo" : "Inactivo"}
            </span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const isActive = row.getValue(id) as boolean;
        return value.includes(isActive ? "active" : "inactive");
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        const isSelf = user.id === actions.currentUserId;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => actions.onEdit(user)}>
                <Pencil className="mr-2 size-4" />
                Editar Perfil
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onChangeRole(user)}
                disabled={isSelf}
              >
                <Shield className="mr-2 size-4" />
                Cambiar Rol
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => actions.onResetPassword(user)}>
                <KeyRound className="mr-2 size-4" />
                Restablecer Contraseña
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={
                  user.isActive
                    ? "text-destructive focus:text-destructive"
                    : "text-emerald-600 focus:text-emerald-600"
                }
                onClick={() => actions.onToggleStatus(user)}
                disabled={isSelf}
              >
                <Power className="mr-2 size-4" />
                {user.isActive ? "Desactivar" : "Activar"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 50,
    },
  ];
}
