import { apiClient } from "@/lib/api/api-client";
import type { ApiResponse, PaginationMeta } from "@/lib/api/types";
import type {
  Supplier,
  CreateSupplierPayload,
  UpdateSupplierPayload,
} from "../types/supplier.types";

const BASE = "/inventory/suppliers";

export async function fetchSuppliers(page = 1, limit = 20) {
  const { data } = await apiClient.get<
    ApiResponse<Supplier[]> & { meta: PaginationMeta }
  >(BASE, { params: { page, limit } });
  return { data: data.data, meta: data.meta };
}

export async function fetchSupplier(id: string) {
  const { data } = await apiClient.get<ApiResponse<Supplier>>(`${BASE}/${id}`);
  return data.data;
}

export async function createSupplier(payload: CreateSupplierPayload) {
  const { data } = await apiClient.post<ApiResponse<Supplier>>(BASE, payload);
  return data.data;
}

export async function updateSupplier(
  id: string,
  payload: UpdateSupplierPayload,
) {
  const { data } = await apiClient.patch<ApiResponse<Supplier>>(
    `${BASE}/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteSupplier(id: string) {
  await apiClient.delete(`${BASE}/${id}`);
}
