import { Injectable } from '@nestjs/common';
import { Database, DbTransaction } from '@/core/database/database.provider';
import { suppliers } from '@/core/database/schemas/inventory/inventory.tables';
import { count, eq } from 'drizzle-orm';
import { PaginationDto } from '@/core/dto/pagination.dto';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '@/core/common/utils/pagination.utils';

@Injectable()
export class SuppliersRepository extends Database {
  async create(data: typeof suppliers.$inferInsert, tx?: DbTransaction) {
    const [newSupplier] = await this.getClient(tx)
      .insert(suppliers)
      .values(data)
      .returning();

    return newSupplier;
  }

  async findAll(
    tenantId: string,
    pagination: PaginationDto,
    tx?: DbTransaction,
  ) {
    const { page, limit, offset } = getPaginationParams(pagination);

    const db = this.getClient(tx);
    const whereCondition = this.withTenant(suppliers, tenantId);

    const [data, totalResult] = await Promise.all([
      db.query.suppliers.findMany({
        where: whereCondition,
        orderBy: (suppliers, { asc }) => [asc(suppliers.name)],
        limit,
        offset,
      }),
      db.select({ value: count() }).from(suppliers).where(whereCondition),
    ]);

    return buildPaginatedResponse(data, totalResult[0].value, page, limit);
  }

  async findById(id: string, tenantId: string, tx?: DbTransaction) {
    return this.getClient(tx).query.suppliers.findFirst({
      where: this.withTenant(suppliers, tenantId, eq(suppliers.id, id)),
    });
  }

  async findOptions(tenantId: string, tx?: DbTransaction) {
    return this.getClient(tx).query.suppliers.findMany({
      where: this.withTenant(suppliers, tenantId),
      columns: { id: true, name: true },
      orderBy: (suppliers, { asc }) => [asc(suppliers.name)],
    });
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<typeof suppliers.$inferSelect>,
    tx?: DbTransaction,
  ) {
    const [updatedSupplier] = await this.getClient(tx)
      .update(suppliers)
      .set({ ...data, updatedAt: new Date() })
      .where(this.withTenant(suppliers, tenantId, eq(suppliers.id, id)))
      .returning();

    return updatedSupplier;
  }

  async remove(id: string, tenantId: string, tx?: DbTransaction) {
    const [deletedSupplier] = await this.getClient(tx)
      .delete(suppliers)
      .where(this.withTenant(suppliers, tenantId, eq(suppliers.id, id)))
      .returning();

    return deletedSupplier;
  }
}
