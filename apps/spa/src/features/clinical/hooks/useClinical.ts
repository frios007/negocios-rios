import {
  useMutation,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useTenantKey, getTenantKey } from "@/lib/query/tenant-key";
import {
  patientsQueryOptions,
  patientOptionsQueryOptions,
  recordsQueryOptions,
  hospitalizationsQueryOptions,
} from "../api/clinical.queries";
import {
  createPatient,
  updatePatient,
  deactivatePatient,
} from "../api/patients.api";
import { createRecord, updateRecord } from "../api/records.api";
import {
  createHospitalization,
  dischargeHospitalization,
  addHospNote,
  addHospItem,
  generateHospBill,
} from "../api/hospitalizations.api";
import type {
  CreatePatientPayload,
  UpdatePatientPayload,
  CreateRecordPayload,
  UpdateRecordPayload,
  CreateHospitalizationPayload,
  AddNotePayload,
  AddItemPayload,
} from "../types/clinical.types";
import { toast } from "sonner";

// ─── Patients ───────────────────────────────────────────────

export function usePatients(page = 1, limit = 200) {
  const tenantKey = useTenantKey();
  return useSuspenseQuery(patientsQueryOptions(tenantKey, page, limit));
}

export function usePatientOptions() {
  const tenantKey = useTenantKey();
  return useSuspenseQuery(patientOptionsQueryOptions(tenantKey));
}

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CreatePatientPayload) => createPatient(p),
    onSuccess: () => {
      toast.success("Paciente registrado");
      qc.invalidateQueries({ queryKey: [...getTenantKey(), "patients"] });
    },
    onError: () => toast.error("Error al registrar paciente"),
  });
}

export function useUpdatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, p }: { id: string; p: UpdatePatientPayload }) =>
      updatePatient(id, p),
    onSuccess: () => {
      toast.success("Paciente actualizado");
      qc.invalidateQueries({ queryKey: [...getTenantKey(), "patients"] });
    },
    onError: () => toast.error("Error al actualizar"),
  });
}

export function useDeactivatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivatePatient(id),
    onSuccess: () => {
      toast.success("Paciente desactivado");
      qc.invalidateQueries({ queryKey: [...getTenantKey(), "patients"] });
    },
    onError: () => toast.error("Error al desactivar"),
  });
}

// ─── Clinical Records ───────────────────────────────────────

export function useRecords(page = 1, limit = 200) {
  const tenantKey = useTenantKey();
  return useSuspenseQuery(recordsQueryOptions(tenantKey, page, limit));
}

export function useCreateRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CreateRecordPayload) => createRecord(p),
    onSuccess: () => {
      toast.success("Consulta registrada");
      const tk = getTenantKey();
      qc.invalidateQueries({ queryKey: [...tk, "clinical-records"] });
      qc.invalidateQueries({ queryKey: [...tk, "patients"] });
    },
    onError: () => toast.error("Error al registrar consulta"),
  });
}

export function useUpdateRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, p }: { id: string; p: UpdateRecordPayload }) =>
      updateRecord(id, p),
    onSuccess: () => {
      toast.success("Registro actualizado");
      qc.invalidateQueries({
        queryKey: [...getTenantKey(), "clinical-records"],
      });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Error al actualizar"),
  });
}

// ─── Hospitalizations ───────────────────────────────────────

export function useHospitalizations(page = 1, limit = 50, status?: string) {
  const tenantKey = useTenantKey();
  return useSuspenseQuery(
    hospitalizationsQueryOptions(tenantKey, page, limit, status),
  );
}

export function useCreateHospitalization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CreateHospitalizationPayload) => createHospitalization(p),
    onSuccess: () => {
      toast.success("Paciente ingresado");
      const tk = getTenantKey();
      qc.invalidateQueries({ queryKey: [...tk, "hospitalizations"] });
      qc.invalidateQueries({ queryKey: [...tk, "clinical-records"] });
      qc.invalidateQueries({ queryKey: [...tk, "patients"] });
    },
    onError: () => toast.error("Error al ingresar paciente"),
  });
}

export function useDischargeHospitalization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      notes,
    }: {
      id: string;
      notes?: string;
    }) => dischargeHospitalization(id, notes),
    onSuccess: () => {
      toast.success("Paciente dado de alta");
      const tk = getTenantKey();
      qc.invalidateQueries({ queryKey: [...tk, "hospitalizations"] });
      qc.invalidateQueries({ queryKey: [...tk, "clinical-records"] });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Error al dar de alta"),
  });
}

export function useAddHospNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, p }: { id: string; p: AddNotePayload }) =>
      addHospNote(id, p),
    onSuccess: () => {
      toast.success("Nota agregada");
      qc.invalidateQueries({
        queryKey: [...getTenantKey(), "hospitalizations"],
      });
    },
    onError: () => toast.error("Error al agregar nota"),
  });
}

export function useAddHospItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, p }: { id: string; p: AddItemPayload }) =>
      addHospItem(id, p),
    onSuccess: () => {
      toast.success("Cargo agregado");
      qc.invalidateQueries({
        queryKey: [...getTenantKey(), "hospitalizations"],
      });
    },
    onError: () => toast.error("Error al agregar cargo"),
  });
}

export function useGenerateHospBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      paymentMethod,
    }: {
      id: string;
      paymentMethod: string;
    }) => generateHospBill(id, paymentMethod),
    onSuccess: () => {
      toast.success("Factura generada correctamente");
      const tk = getTenantKey();
      qc.invalidateQueries({ queryKey: [...tk, "hospitalizations"] });
      qc.invalidateQueries({ queryKey: [...tk, "sales"] });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Error al generar factura"),
  });
}
