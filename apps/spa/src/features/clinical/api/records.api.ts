import { apiClient } from "@/lib/api/api-client";
import type { ApiResponse, PaginationMeta } from "@/lib/api/types";
import type {
  ClinicalRecord,
  CreateRecordPayload,
  UpdateRecordPayload,
} from "../types/clinical.types";

const BASE = "/clinical/records";

export async function fetchRecords(page = 1, limit = 200) {
  const { data } = await apiClient.get<
    ApiResponse<ClinicalRecord[]> & { meta: PaginationMeta }
  >(BASE, { params: { page, limit } });
  return { data: data.data, meta: data.meta };
}

export async function fetchRecord(id: string) {
  const { data } = await apiClient.get<ApiResponse<ClinicalRecord>>(
    `${BASE}/${id}`,
  );
  return data.data;
}

export async function createRecord(payload: CreateRecordPayload) {
  const { data } = await apiClient.post<ApiResponse<ClinicalRecord>>(
    BASE,
    payload,
  );
  return data.data;
}

export async function updateRecord(
  id: string,
  payload: UpdateRecordPayload,
) {
  const { data } = await apiClient.patch<ApiResponse<ClinicalRecord>>(
    `${BASE}/${id}`,
    payload,
  );
  return data.data;
}
