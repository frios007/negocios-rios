import { Injectable } from '@nestjs/common';
import { Database, DbTransaction } from '@/core/database/database.provider';
import { categories } from '@/core/database/schemas/inventory/inventory.tables';
import { eq, count } from 'drizzle-orm';
import { PaginationDto } from '@/core/dto/pagination.dto';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '@/core/common/utils/pagination.utils';

@Injectable()
export class CategoriesRepository extends Database {
  async create(data: typeof categories.$inferInsert, tx?: DbTransaction) {
    const [newCategory] = await this.getClient(tx)
      .insert(categories)
      .values(data)
      .returning();

    return newCategory;
  }

  async findAll(
    tenantId: string,
    pagination: PaginationDto,
    tx?: DbTransaction,
  ) {
    const { page, limit, offset } = getPaginationParams(pagination);

    const db = this.getClient(tx);
    const whereCondition = this.withTenant(categories, tenantId);

    const [data, totalResult] = await Promise.all([
      db.query.categories.findMany({
        where: whereCondition,
        orderBy: (categories, { asc }) => [asc(categories.name)],
        limit,
        offset,
      }),
      db.select({ value: count() }).from(categories).where(whereCondition),
    ]);

    return buildPaginatedResponse(data, totalResult[0].value, page, limit);
  }

  async findById(id: string, tenantId: string, tx?: DbTransaction) {
    return this.getClient(tx).query.categories.findFirst({
      where: this.withTenant(categories, tenantId, eq(categories.id, id)),
    });
  }

  async findOptions(tenantId: string, tx?: DbTransaction) {
    return this.getClient(tx).query.categories.findMany({
      where: this.withTenant(categories, tenantId),
      columns: { id: true, name: true },
      orderBy: (categories, { asc }) => [asc(categories.name)],
    });
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<typeof categories.$inferInsert>,
    tx?: DbTransaction,
  ) {
    const [updatedCategory] = await this.getClient(tx)
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(this.withTenant(categories, tenantId, eq(categories.id, id)))
      .returning();

    return updatedCategory;
  }

  async remove(id: string, tenantId: string, tx?: DbTransaction) {
    const [deletedCategory] = await this.getClient(tx)
      .delete(categories)
      .where(this.withTenant(categories, tenantId, eq(categories.id, id)))
      .returning();

    return deletedCategory;
  }
}
