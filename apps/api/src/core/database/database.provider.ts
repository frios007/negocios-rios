import { Inject } from '@nestjs/common';
import {
  NodePgDatabase,
  NodePgQueryResultHKT,
} from 'drizzle-orm/node-postgres';
import * as schema from './schemas';
import { DATABASE_CONNECTION } from './database-connection';
import { and, eq, ExtractTablesWithRelations, SQLWrapper } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';

export type DbTransaction = PgTransaction<
  NodePgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export type DbClient = NodePgDatabase<typeof schema>;

type TenantTable = {
  businessUnitId: any;
};

export abstract class Database {
  constructor(@Inject(DATABASE_CONNECTION) protected readonly db: DbClient) {}

  /**
   * Multi-tenant Helper
   * Automatically adds the businessUnitId filter to any query.
   * @param table The Drizzle table object (e.g., categories, products)
   * @param tenantId The UUID of the business unit
   * @param customCondition Optional extra conditions (e.g., eq(table.id, id))
   */
  protected withTenant<T extends TenantTable>(
    table: T,
    tenantId: string,
    customCondition?: SQLWrapper,
  ) {
    const tenantFilter = eq(table.businessUnitId, tenantId);

    if (customCondition) return and(tenantFilter, customCondition);

    return tenantFilter;
  }

  protected getClient(tx?: DbTransaction) {
    return tx || this.db;
  }
}
