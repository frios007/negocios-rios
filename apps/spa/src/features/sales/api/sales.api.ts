import { apiClient } from "@/lib/api/api-client";
import type { ApiResponse, PaginationMeta } from "@/lib/api/types";
import type {
  Sale,
  SaleWithDetails,
  CreateSalePayload,
} from "../types/sale.types";

const BASE = "/sales";

export async function fetchSales(page = 1, limit = 20) {
  const { data } = await apiClient.get<
    ApiResponse<Sale[]> & { meta: PaginationMeta }
  >(BASE, { params: { page, limit } });
  return { data: data.data, meta: data.meta };
}

export async function fetchSaleById(id: string) {
  const { data } = await apiClient.get<ApiResponse<SaleWithDetails>>(
    `${BASE}/${id}`,
  );
  return data.data;
}

export async function createSale(payload: CreateSalePayload) {
  const { data } = await apiClient.post<ApiResponse<Sale>>(BASE, payload);
  return data.data;
}

export async function voidSale(id: string) {
  const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
    `${BASE}/${id}/void`,
  );
  return data.data;
}

export async function addPayment(
  saleId: string,
  payload: { amount: number; paymentMethod: string; referenceNumber?: string },
) {
  const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
    `${BASE}/${saleId}/payments`,
    payload,
  );
  return data.data;
}
