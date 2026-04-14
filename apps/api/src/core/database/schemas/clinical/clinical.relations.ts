import { relations } from 'drizzle-orm';
import {
  patients,
  clinicalRecords,
  hospitalizations,
  hospitalizationNotes,
  hospitalizationItems,
} from './clinical.tables';
import { businessUnits, users } from '../core/core.tables';
import { client, sales } from '../sales/sales.tables';

export const patientsRelations = relations(patients, ({ one, many }) => ({
  client: one(client, {
    fields: [patients.clientId],
    references: [client.id],
  }),
  businessUnit: one(businessUnits, {
    fields: [patients.businessUnitId],
    references: [businessUnits.id],
  }),
  clinicalRecords: many(clinicalRecords),
  hospitalizations: many(hospitalizations),
}));

export const clinicalRecordsRelations = relations(
  clinicalRecords,
  ({ one }) => ({
    patient: one(patients, {
      fields: [clinicalRecords.patientId],
      references: [patients.id],
    }),
    vet: one(users, {
      fields: [clinicalRecords.vetId],
      references: [users.id],
    }),
    businessUnit: one(businessUnits, {
      fields: [clinicalRecords.businessUnitId],
      references: [businessUnits.id],
    }),
    hospitalization: one(hospitalizations, {
      fields: [clinicalRecords.hospitalizationId],
      references: [hospitalizations.id],
    }),
    sale: one(sales, {
      fields: [clinicalRecords.saleId],
      references: [sales.id],
    }),
  }),
);

export const hospitalizationsRelations = relations(
  hospitalizations,
  ({ one, many }) => ({
    patient: one(patients, {
      fields: [hospitalizations.patientId],
      references: [patients.id],
    }),
    vet: one(users, {
      fields: [hospitalizations.vetId],
      references: [users.id],
    }),
    businessUnit: one(businessUnits, {
      fields: [hospitalizations.businessUnitId],
      references: [businessUnits.id],
    }),
    sale: one(sales, {
      fields: [hospitalizations.saleId],
      references: [sales.id],
    }),
    notes: many(hospitalizationNotes),
    items: many(hospitalizationItems),
    clinicalRecords: many(clinicalRecords),
  }),
);

export const hospitalizationNotesRelations = relations(
  hospitalizationNotes,
  ({ one }) => ({
    hospitalization: one(hospitalizations, {
      fields: [hospitalizationNotes.hospitalizationId],
      references: [hospitalizations.id],
    }),
    vet: one(users, {
      fields: [hospitalizationNotes.vetId],
      references: [users.id],
    }),
  }),
);

export const hospitalizationItemsRelations = relations(
  hospitalizationItems,
  ({ one }) => ({
    hospitalization: one(hospitalizations, {
      fields: [hospitalizationItems.hospitalizationId],
      references: [hospitalizations.id],
    }),
  }),
);
