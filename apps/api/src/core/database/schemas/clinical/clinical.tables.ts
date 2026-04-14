import {
  pgSchema,
  uuid,
  varchar,
  text,
  decimal,
  integer,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';

import { businessUnits, users } from '../core/core.tables';
import { client, sales } from '../sales/sales.tables';

export const clinicalSchema = pgSchema('clinical');

export const recordStatusEnum = clinicalSchema.enum('record_status', [
  'CONSULTATION',
  'ADMITTED',
  'DISCHARGED',
  'CANCELLED',
]);

export const hospitalizationStatusEnum = clinicalSchema.enum(
  'hospitalization_status',
  ['ACTIVE', 'DISCHARGED', 'DECEASED'],
);

// ─── Patients ─────────────────────────────────────────────
export const patients = clinicalSchema.table('patients', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  species: varchar('species', { length: 50 }).notNull(),
  breed: varchar('breed', { length: 100 }),
  sex: varchar('sex', { length: 10 }),
  color: varchar('color', { length: 50 }),
  dateOfBirth: timestamp('date_of_birth'),
  isActive: boolean('is_active').default(true).notNull(),

  clientId: uuid('client_id')
    .notNull()
    .references(() => client.id, { onDelete: 'cascade' }),

  businessUnitId: uuid('business_unit_id')
    .notNull()
    .references(() => businessUnits.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Hospitalizations ─────────────────────────────────────
export const hospitalizations = clinicalSchema.table('hospitalizations', {
  id: uuid('id').defaultRandom().primaryKey(),

  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),

  vetId: uuid('vet_id')
    .notNull()
    .references(() => users.id),

  reason: varchar('reason', { length: 255 }).notNull(),
  diagnosis: text('diagnosis'),

  admittedAt: timestamp('admitted_at').defaultNow().notNull(),
  dischargedAt: timestamp('discharged_at'),
  estimatedDays: integer('estimated_days'),
  dailyRate: decimal('daily_rate', { precision: 10, scale: 2 }),

  status: hospitalizationStatusEnum('status').default('ACTIVE').notNull(),
  dischargeNotes: text('discharge_notes'),

  saleId: uuid('sale_id').references(() => sales.id, { onDelete: 'set null' }),

  businessUnitId: uuid('business_unit_id')
    .notNull()
    .references(() => businessUnits.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Hospitalization Notes (Daily Progress) ───────────────
export const hospitalizationNotes = clinicalSchema.table(
  'hospitalization_notes',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    hospitalizationId: uuid('hospitalization_id')
      .notNull()
      .references(() => hospitalizations.id, { onDelete: 'cascade' }),

    vetId: uuid('vet_id')
      .notNull()
      .references(() => users.id),

    weight: decimal('weight', { precision: 5, scale: 2 }),
    temperature: decimal('temperature', { precision: 4, scale: 1 }),
    observations: text('observations').notNull(),
    treatment: text('treatment'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
);

// ─── Hospitalization Items (Products/Services used) ───────
export const hospitalizationItems = clinicalSchema.table(
  'hospitalization_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    hospitalizationId: uuid('hospitalization_id')
      .notNull()
      .references(() => hospitalizations.id, { onDelete: 'cascade' }),

    description: varchar('description', { length: 255 }).notNull(),
    quantity: integer('quantity').default(1).notNull(),
    unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
);

// ─── Clinical Records ─────────────────────────────────────
export const clinicalRecords = clinicalSchema.table('clinical_records', {
  id: uuid('id').defaultRandom().primaryKey(),

  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),

  vetId: uuid('vet_id')
    .notNull()
    .references(() => users.id),

  weight: decimal('weight', { precision: 5, scale: 2 }),
  temperature: decimal('temperature', { precision: 4, scale: 1 }),

  reason: varchar('reason', { length: 255 }).notNull(),
  diagnosis: text('diagnosis'),
  prescription: text('prescription'),
  internalNotes: text('internal_notes'),

  status: recordStatusEnum('status').default('CONSULTATION').notNull(),

  hospitalizationId: uuid('hospitalization_id').references(
    () => hospitalizations.id,
    { onDelete: 'set null' },
  ),

  saleId: uuid('sale_id').references(() => sales.id, { onDelete: 'set null' }),

  businessUnitId: uuid('business_unit_id')
    .notNull()
    .references(() => businessUnits.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
