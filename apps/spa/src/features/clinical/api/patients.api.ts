import { apiClient } from "@/lib/api/api-client";
import type { ApiResponse, PaginationMeta } from "@/lib/api/types";
import type {
  Patient,
  PatientDetail,
  PatientOption,
  CreatePatientPayload,
  UpdatePatientPayload,
} from "../types/clinical.types";

const BASE = "/clinical/patients";

export async function fetchPatients(page = 1, limit = 200) {
  const { data } = await apiClient.get<
    ApiResponse<Patient[]> & { meta: PaginationMeta }
  >(BASE, { params: { page, limit } });
  return { data: data.data, meta: data.meta };
}

export async function fetchPatientOptions() {
  const { data } = await apiClient.get<ApiResponse<PatientOption[]>>(
    `${BASE}/options`,
  );
  return data.data;
}

export async function fetchPatient(id: string) {
  const { data } = await apiClient.get<ApiResponse<PatientDetail>>(
    `${BASE}/${id}`,
  );
  return data.data;
}

export async function createPatient(payload: CreatePatientPayload) {
  const { data } = await apiClient.post<ApiResponse<Patient>>(BASE, payload);
  return data.data;
}

export async function updatePatient(
  id: string,
  payload: UpdatePatientPayload,
) {
  const { data } = await apiClient.patch<ApiResponse<Patient>>(
    `${BASE}/${id}`,
    payload,
  );
  return data.data;
}

export async function deactivatePatient(id: string) {
  const { data } = await apiClient.delete<ApiResponse<Patient>>(
    `${BASE}/${id}`,
  );
  return data.data;
}
