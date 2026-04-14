import {
  pgSchema,
  uuid,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

import { businessUnits, users } from "../core/core.tables";

export const inventorySchema = pgSchema("inventory");

export const movementTypeEnum = inventorySchema.enum("movement_type", [
  "PURCHASE_IN",
  "SALE_OUT",
  "ADJUSTMENT_IN",
  "ADJUSTMENT_OUT",
]);

export const movementTypes = movementTypeEnum.enumValues;

export type MovementType = (typeof movementTypes)[number];

export const productTypeEnum = inventorySchema.enum("product_type", [
  "GOODS",
  "SERVICE",
]);
export type ProductType = (typeof productTypeEnum.enumValues)[number];

export const categories = inventorySchema.table("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  businessUnitId: uuid("business_unit_id")
    .notNull()
    .references(() => businessUnits.id, { onDelete: "cascade" }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const suppliers = inventorySchema.table("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  email: varchar("email", { length: 100 }),
  businessUnitId: uuid("business_unit_id")
    .notNull()
    .references(() => businessUnits.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const products = inventorySchema.table("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  productType: productTypeEnum("product_type").default("GOODS").notNull(),
  barcode: varchar("barcode", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  supplierId: uuid("supplier_id").references(() => suppliers.id, {
    onDelete: "set null",
  }),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).notNull(),
  profitMargin: decimal("profit_margin", { precision: 5, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isSample: boolean("is_sample").default(false).notNull(),
  isRegulated: boolean("is_regulated").default(false).notNull(),
  businessUnitId: uuid("business_unit_id")
    .notNull()
    .references(() => businessUnits.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const stockMovements = inventorySchema.table("stock_movement", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: movementTypeEnum("type").notNull(),
  quantity: integer("quantity").notNull(),
  batchNumber: varchar("batch_number", { length: 100 }),
  expirationDate: timestamp("expiration_date"),
  notes: text("notes"),
  businessUnitId: uuid("business_unit_id")
    .notNull()
    .references(() => businessUnits.id, { onDelete: "cascade" }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
