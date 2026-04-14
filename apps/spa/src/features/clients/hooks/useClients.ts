import { useMutation, useSuspenseQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createClient,
  updateClient,
  deleteClient,
} from "../api/clients.api";
import { clientsQueryOptions, clientOptionsQueryOptions } from "../api/clients.queries";
import type {
  CreateClientPayload,
  UpdateClientPayload,
} from "../types/client.types";
import { useTenantKey, getTenantKey } from "@/lib/query/tenant-key";
import { toast } from "sonner";

export function useClients(page = 1, limit = 200) {
  const tenantKey = useTenantKey();
  return useSuspenseQuery(clientsQueryOptions(tenantKey, page, limit));
}

// Client options used inside dialogs — keep as useQuery (not route-level)
export function useClientOptions() {
  const tenantKey = useTenantKey();
  return useQuery(clientOptionsQueryOptions(tenantKey));
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClientPayload) => createClient(payload),
    onSuccess: () => {
      toast.success("Cliente registrado correctamente");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "clients"] });
    },
    onError: () => toast.error("Error al registrar el cliente"),
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClientPayload }) =>
      updateClient(id, payload),
    onSuccess: () => {
      toast.success("Cliente actualizado correctamente");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "clients"] });
    },
    onError: () => toast.error("Error al actualizar el cliente"),
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => {
      toast.success("Cliente desactivado correctamente");
      const tenantKey = getTenantKey();
      queryClient.invalidateQueries({ queryKey: [...tenantKey, "clients"] });
    },
    onError: () => toast.error("Error al desactivar el cliente"),
  });
}
