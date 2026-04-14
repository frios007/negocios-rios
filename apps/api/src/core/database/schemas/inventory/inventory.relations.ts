import { relations } from 'drizzle-orm';
import {
  categories,
  suppliers,
  products,
  stockMovements,
} from './inventory.tables';
import { businessUnits, users } from '../core/core.tables';
import { salesDetails } from '../sales/sales.tables';

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  businessUnit: one(businessUnits, {
    fields: [categories.businessUnitId],
    references: [businessUnits.id],
  }),
  products: many(products),
}));

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  businessUnit: one(businessUnits, {
    fields: [suppliers.businessUnitId],
    references: [businessUnits.id],
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
  }),
  businessUnit: one(businessUnits, {
    fields: [products.businessUnitId],
    references: [businessUnits.id],
  }),
  salesDetails: many(salesDetails),
  stockMovement: many(stockMovements),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  product: one(products, {
    fields: [stockMovements.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [stockMovements.userId],
    references: [users.id],
  }),
  businessUnit: one(businessUnits, {
    fields: [stockMovements.businessUnitId],
    references: [businessUnits.id],
  }),
}));
