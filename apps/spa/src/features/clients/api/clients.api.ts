import { apiClient } from "@/lib/api/api-client";
import type { ApiResponse, PaginationMeta } from "@/lib/api/types";
import type {
  Client,
  CreateClientPayload,
  UpdateClientPayload,
  ClientOption,
} from "../types/client.types";

const BASE = "/sales/clients";

export async function fetchClients(page = 1, limit = 20) {
  const { data } = await apiClient.get<
    ApiResponse<Client[]> & { meta: PaginationMeta }
  >(BASE, { params: { page, limit } });
  return { data: data.data, meta: data.meta };
}

export async function createClient(payload: CreateClientPayload) {
  const { data } = await apiClient.post<ApiResponse<Client>>(BASE, payload);
  return data.data;
}

export async function updateClient(id: string, payload: UpdateClientPayload) {
  const { data } = await apiClient.patch<ApiResponse<Client>>(
    `${BASE}/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteClient(id: string) {
  await apiClient.delete(`${BASE}/${id}`);
}

export async function fetchClientOptions() {
  const { data } = await apiClient.get<ApiResponse<ClientOption[]>>(
    `${BASE}/options`,
  );
  return data.data;
}
