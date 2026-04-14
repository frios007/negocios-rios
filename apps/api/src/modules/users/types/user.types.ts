import {
  users,
  userBusinessUnits,
  businessUnits,
} from '@/core/database/schemas/core/core.tables';

export type User = typeof users.$inferSelect;
export type UserBusinessUnit = typeof userBusinessUnits.$inferSelect;
export type BusinessUnit = typeof businessUnits.$inferSelect;

export type UserBusinessUnitWithDetails = UserBusinessUnit & {
  businessUnit: BusinessUnit;
};

export type UserWithBusinessUnits = User & {
  userBusinessUnits: UserBusinessUnitWithDetails[];
};

