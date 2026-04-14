import { apiClient } from "@/lib/api/api-client";
import type { ApiResponse, PaginationMeta } from "@/lib/api/types";
import type {
  Hospitalization,
  CreateHospitalizationPayload,
  AddNotePayload,
  AddItemPayload,
  HospitalizationNote,
  HospitalizationItem,
} from "../types/clinical.types";

const BASE = "/clinical/hospitalizations";

export async function fetchHospitalizations(
  page = 1,
  limit = 50,
  status?: string,
) {
  const { data } = await apiClient.get<
    ApiResponse<Hospitalization[]> & { meta: PaginationMeta }
  >(BASE, { params: { page, limit, status } });
  return { data: data.data, meta: data.meta };
}

export async function fetchHospitalization(id: string) {
  const { data } = await apiClient.get<ApiResponse<Hospitalization>>(
    `${BASE}/${id}`,
  );
  return data.data;
}

export async function createHospitalization(
  payload: CreateHospitalizationPayload,
) {
  const { data } = await apiClient.post<ApiResponse<Hospitalization>>(
    BASE,
    payload,
  );
  return data.data;
}

export async function dischargeHospitalization(
  id: string,
  dischargeNotes?: string,
) {
  const { data } = await apiClient.patch<ApiResponse<Hospitalization>>(
    `${BASE}/${id}/discharge`,
    { dischargeNotes },
  );
  return data.data;
}

export async function addHospNote(id: string, payload: AddNotePayload) {
  const { data } = await apiClient.post<ApiResponse<HospitalizationNote>>(
    `${BASE}/${id}/notes`,
    payload,
  );
  return data.data;
}

export async function addHospItem(id: string, payload: AddItemPayload) {
  const { data } = await apiClient.post<ApiResponse<HospitalizationItem>>(
    `${BASE}/${id}/items`,
    payload,
  );
  return data.data;
}

export async function generateHospBill(
  id: string,
  paymentMethod = "CASH",
) {
  const { data } = await apiClient.post<ApiResponse<any>>(
    `${BASE}/${id}/bill`,
    { paymentMethod },
  );
  return data.data;
}
