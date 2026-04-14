import { pgSchema, uuid, varchar, timestamp, boolean, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const coreSchema = pgSchema('core');

export const roleEnum = coreSchema.enum('role_enum', [
  'OWNER',
  'ADMIN',
  'VET',
  'PHARMACIST',
  'CASHIER',
]);
export type UserRole = (typeof roleEnum.enumValues)[number];

export const businessUnitTypeEnum = coreSchema.enum('business_unit_type', [
  'VETERINARY',
  'PHARMACY',
]);
export type BusinessUnitType = (typeof businessUnitTypeEnum.enumValues)[number];

export const businessUnits = coreSchema.table('business_units', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  type: businessUnitTypeEnum('type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const users = coreSchema.table('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userBusinessUnits = coreSchema.table(
  'user_business_units',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    businessUnitId: uuid('business_id')
      .notNull()
      .references(() => businessUnits.id, { onDelete: 'cascade' }),
    role: roleEnum('role').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('user_business_units_user_id_business_id_idx').on(
      t.userId,
      t.businessUnitId,
    ),
    uniqueIndex('user_bu_unique_idx').on(t.userId, t.businessUnitId),
  ],
);

export const refreshTokens = coreSchema.table('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
