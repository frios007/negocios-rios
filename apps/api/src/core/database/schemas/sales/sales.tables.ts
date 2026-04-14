import {
  pgSchema,
  uuid,
  varchar,
  decimal,
  integer,
  timestamp,
  numeric,
  boolean,
  text,
  date,
} from 'drizzle-orm/pg-core';

import { businessUnits } from '../core/core.tables';
import { products } from '../inventory/inventory.tables';
import { users } from '../core/core.tables';

export const salesSchema = pgSchema('sales');

export const paymentMethodEnum = salesSchema.enum('payment_method', [
  'CASH',
  'CARD',
  'TRANSFER',
  'CREDIT',
]);
export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];

export const paymentStatusEnum = salesSchema.enum('payment_status', [
  'PAID',
  'PENDING',
  'PARTIAL',
]);
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];

export const saleStatusEnum = salesSchema.enum('sale_status', [
  'COMPLETED',
  'VOIDED'
]);
export type SaleStatus = (typeof saleStatusEnum.enumValues)[number];

export const client = salesSchema.table('client', {
  id: uuid('id').defaultRandom().primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }),
  documentId: varchar('document_id', { length: 50 }),
  phoneNumber: varchar('phone_number', { length: 20 }),
  businessUnitId: uuid('business_unit_id')
    .notNull()
    .references(() => businessUnits.id, { onDelete: 'cascade' }),
  creditLimit: decimal('credit_limit', { precision: 10, scale: 2 })
    .default('0')
    .notNull(),
  balanceDue: decimal('balance_due', { precision: 10, scale: 2 })
    .default('0')
    .notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sales = salesSchema.table('sales', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => client.id, {
    onDelete: 'set null',
  }),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),

  subTotal: decimal('sub_total', { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 })
    .default('0.00')
    .notNull(),

  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum('payment_method').default('CASH').notNull(),
  paymentStatus: paymentStatusEnum('payment_status').default('PAID').notNull(),
  dueDate: timestamp('due_date'),

  status: saleStatusEnum('status').default('COMPLETED').notNull(),

  businessUnitId: uuid('business_unit_id')
    .notNull()
    .references(() => businessUnits.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const salesDetails = salesSchema.table('sales_details', {
  id: uuid('id').defaultRandom().primaryKey(),

  saleId: uuid('sale_id')
    .notNull()
    .references(() => sales.id, { onDelete: 'cascade' }),

  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),

  quantity: integer('quantity').notNull(),

  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),

  lineDiscount: decimal('line_discount', { precision: 10, scale: 2 })
    .default('0.00')
    .notNull(),

  businessUnitId: uuid('business_unit_id')
    .notNull()
    .references(() => businessUnits.id, { onDelete: 'cascade' }),
});

export const payments = salesSchema.table('payments', {
  id: uuid('id').primaryKey().defaultRandom(),

  saleId: uuid('sale_id').references(() => sales.id, { onDelete: 'cascade' }),
  clientId: uuid('client_id').references(() => client.id, {
    onDelete: 'set null',
  }),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),

  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),

  paymentMethod: paymentMethodEnum('payment_method').notNull(),

  referenceNumber: varchar('reference_number', { length: 255 }),

  businessUnitId: uuid('business_unit_id')
    .notNull()
    .references(() => businessUnits.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Expense Categories ───────────────────────────────
export const expenseCategories = salesSchema.table('expense_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  businessUnitId: uuid('business_unit_id')
    .notNull()
    .references(() => businessUnits.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Expenses ─────────────────────────────────────────
export const expensePaymentMethodEnum = salesSchema.enum('expense_payment_method', [
  'CASH',
  'CARD',
  'TRANSFER',
]);
export type ExpensePaymentMethod = (typeof expensePaymentMethodEnum.enumValues)[number];

export const expenses = salesSchema.table('expenses', {
  id: uuid('id').defaultRandom().primaryKey(),
  description: varchar('description', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  categoryId: uuid('category_id').references(() => expenseCategories.id, {
    onDelete: 'set null',
  }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  businessUnitId: uuid('business_unit_id')
    .notNull()
    .references(() => businessUnits.id, { onDelete: 'cascade' }),
  expenseDate: date('expense_date').defaultNow().notNull(),
  paymentMethod: expensePaymentMethodEnum('payment_method').default('CASH').notNull(),
  referenceNumber: varchar('reference_number', { length: 255 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
