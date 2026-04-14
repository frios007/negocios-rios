import { apiClient } from "@/lib/api/api-client";
import type { ApiResponse, PaginationMeta } from "@/lib/api/types";
import type {
  StockMovement,
  CreateStockMovementPayload,
} from "../types/stock-movement.types";

const BASE = "/inventory/stock-movements";

export async function fetchStockMovements(page = 1, limit = 20) {
  const { data } = await apiClient.get<
    ApiResponse<StockMovement[]> & { meta: PaginationMeta }
  >(BASE, { params: { page, limit } });
  return { data: data.data, meta: data.meta };
}

export async function createStockMovement(payload: CreateStockMovementPayload) {
  const { data } = await apiClient.post<ApiResponse<StockMovement>>(
    BASE,
    payload,
  );
  return data.data;
}
