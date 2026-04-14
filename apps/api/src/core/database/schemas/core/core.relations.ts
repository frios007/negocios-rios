import { relations } from 'drizzle-orm';
import { businessUnits, users, userBusinessUnits, refreshTokens } from './core.tables';
import { patients, clinicalRecords } from '../clinical/clinical.tables';
import {
  categories,
  suppliers,
  products,
  stockMovements,
} from '../inventory/inventory.tables';
import { client, sales, salesDetails } from '../sales/sales.tables';

export const businessUnitsRelations = relations(businessUnits, ({ many }) => ({
  userBusinessUnits: many(userBusinessUnits),
  patients: many(patients),
  clinicalRecords: many(clinicalRecords),
  categories: many(categories),
  suppliers: many(suppliers),
  products: many(products),
  clients: many(client),
  sales: many(sales),
  salesDetails: many(salesDetails),
  stockMovements: many(stockMovements),
}));

export const usersRelations = relations(users, ({ many }) => ({
  userBusinessUnits: many(userBusinessUnits),
  clinicalRecords: many(clinicalRecords),
  sales: many(sales),
  stockMovements: many(stockMovements),
  refreshTokens: many(refreshTokens),
}));

export const userBusinessUnitsRelations = relations(
  userBusinessUnits,
  ({ one }) => ({
    user: one(users, {
      fields: [userBusinessUnits.userId],
      references: [users.id],
    }),
    businessUnit: one(businessUnits, {
      fields: [userBusinessUnits.businessUnitId],
      references: [businessUnits.id],
    }),
  }),
);

export const refreshTokensRelations = relations(
  refreshTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [refreshTokens.userId],
      references: [users.id],
    }),
  }),
);
