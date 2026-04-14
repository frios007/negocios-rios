import { apiClient } from "@/lib/api/api-client";
import type { ApiResponse, PaginationMeta } from "@/lib/api/types";
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  OptionItem,
} from "../types/product.types";

const BASE = "/inventory/products";

export async function fetchProducts(page = 1, limit = 20) {
  const { data } = await apiClient.get<
    ApiResponse<Product[]> & { meta: PaginationMeta }
  >(BASE, { params: { page, limit } });
  return { data: data.data, meta: data.meta };
}

export async function createProduct(payload: CreateProductPayload) {
  const { data } = await apiClient.post<ApiResponse<Product>>(BASE, payload);
  return data.data;
}

export async function updateProduct(
  id: string,
  payload: UpdateProductPayload,
) {
  const { data } = await apiClient.patch<ApiResponse<Product>>(
    `${BASE}/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteProduct(id: string) {
  await apiClient.delete(`${BASE}/${id}`);
}

export async function fetchCategoryOptions() {
  const { data } = await apiClient.get<ApiResponse<OptionItem[]>>(
    "/inventory/categories/options",
  );
  return data.data;
}

export async function fetchSupplierOptions() {
  const { data } = await apiClient.get<ApiResponse<OptionItem[]>>(
    "/inventory/suppliers/options",
  );
  return data.data;
}

export async function fetchProductOptions() {
  const { data } = await apiClient.get<ApiResponse<OptionItem[]>>(
    `${BASE}/options`,
  );
  return data.data;
}
