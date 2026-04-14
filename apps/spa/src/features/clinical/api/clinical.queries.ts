import { queryOptions } from "@tanstack/react-query";
import { fetchPatients, fetchPatientOptions } from "./patients.api";
import { fetchRecords } from "./records.api";
import { fetchHospitalizations } from "./hospitalizations.api";

export const patientsQueryOptions = (
  tenantKey: readonly [string, string],
  page = 1,
  limit = 200,
) =>
  queryOptions({
    queryKey: [...tenantKey, "patients", { page, limit }] as const,
    queryFn: () => fetchPatients(page, limit),
  });

export const patientOptionsQueryOptions = (
  tenantKey: readonly [string, string],
) =>
  queryOptions({
    queryKey: [...tenantKey, "patients", "options"] as const,
    queryFn: () => fetchPatientOptions(),
  });

export const recordsQueryOptions = (
  tenantKey: readonly [string, string],
  page = 1,
  limit = 200,
) =>
  queryOptions({
    queryKey: [...tenantKey, "clinical-records", { page, limit }] as const,
    queryFn: () => fetchRecords(page, limit),
  });

export const hospitalizationsQueryOptions = (
  tenantKey: readonly [string, string],
  page = 1,
  limit = 50,
  status?: string,
) =>
  queryOptions({
    queryKey: [
      ...tenantKey,
      "hospitalizations",
      { page, limit, status },
    ] as const,
    queryFn: () => fetchHospitalizations(page, limit, status),
  });
