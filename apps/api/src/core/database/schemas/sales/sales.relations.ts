import { relations } from 'drizzle-orm';
import { client, sales, salesDetails, expenseCategories, expenses } from './sales.tables';
import { businessUnits, users } from '../core/core.tables';
import { patients } from '../clinical/clinical.tables';
import { products } from '../inventory/inventory.tables';

export const clientsRelations = relations(client, ({ one, many }) => ({
  businessUnit: one(businessUnits, {
    fields: [client.businessUnitId],
    references: [businessUnits.id],
  }),
  patients: many(patients),
  sales: many(sales),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  client: one(client, {
    fields: [sales.clientId],
    references: [client.id],
  }),
  user: one(users, {
    fields: [sales.userId],
    references: [users.id],
  }),
  businessUnit: one(businessUnits, {
    fields: [sales.businessUnitId],
    references: [businessUnits.id],
  }),
  salesDetails: many(salesDetails),
}));

export const salesDetailsRelations = relations(salesDetails, ({ one }) => ({
  sale: one(sales, {
    fields: [salesDetails.saleId],
    references: [sales.id],
  }),
  product: one(products, {
    fields: [salesDetails.productId],
    references: [products.id],
  }),
  businessUnit: one(businessUnits, {
    fields: [salesDetails.businessUnitId],
    references: [businessUnits.id],
  }),
}));

export const expenseCategoriesRelations = relations(expenseCategories, ({ one, many }) => ({
  businessUnit: one(businessUnits, {
    fields: [expenseCategories.businessUnitId],
    references: [businessUnits.id],
  }),
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id],
  }),
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
  businessUnit: one(businessUnits, {
    fields: [expenses.businessUnitId],
    references: [businessUnits.id],
  }),
}));
