import { useMutation, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUser,
  updateUser,
  toggleUserStatus,
  updateUserRole,
  resetUserPassword,
  assignUserToBU,
  unassignUserFromBU,
} from "../api/users.api";
import { usersQueryOptions } from "../api/users.queries";
import type { CreateUserPayload, UpdateUserPayload, AssignUserPayload } from "../types/user.types";
import { useTenantKey, getTenantKey } from "@/lib/query/tenant-key";
import { toast } from "sonner";

export function useUsers(page = 1, limit = 200) {
  const tenantKey = useTenantKey();
  return useSuspenseQuery(usersQueryOptions(tenantKey, page, limit));
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      toast.success("Usuario creado correctamente");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "users"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Error al crear el usuario";
      toast.error(msg);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      updateUser(id, payload),
    onSuccess: () => {
      toast.success("Usuario actualizado correctamente");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "users"] });
    },
    onError: () => toast.error("Error al actualizar el usuario"),
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleUserStatus(id),
    onSuccess: (_data, _id) => {
      toast.success("Estado del usuario actualizado");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "users"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Error al cambiar el estado";
      toast.error(msg);
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      updateUserRole(id, role),
    onSuccess: () => {
      toast.success("Rol actualizado correctamente");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "users"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Error al actualizar el rol";
      toast.error(msg);
    },
  });
}

export function useResetUserPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      resetUserPassword(id, newPassword),
    onSuccess: () => {
      toast.success("Contraseña restablecida correctamente");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Error al restablecer la contraseña";
      toast.error(msg);
    },
  });
}

export function useAssignUserToBU() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AssignUserPayload }) =>
      assignUserToBU(id, payload),
    onSuccess: () => {
      toast.success("Usuario asignado al negocio");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "users"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Error al asignar";
      toast.error(msg);
    },
  });
}

export function useUnassignUserFromBU() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, buId }: { userId: string; buId: string }) =>
      unassignUserFromBU(userId, buId),
    onSuccess: () => {
      toast.success("Usuario desasignado del negocio");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "users"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Error al desasignar";
      toast.error(msg);
    },
  });
}
