import { Injectable } from '@nestjs/common';
import { Database, DbTransaction } from '@/core/database/database.provider';
import {
  products,
  stockMovements,
} from '@/core/database/schemas/inventory/inventory.tables';
import { count, eq, sql } from 'drizzle-orm';
import { PaginationDto } from '@/core/dto/pagination.dto';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '@/core/common/utils/pagination.utils';

@Injectable()
export class StockMovementsRepository extends Database {
  async create(data: typeof stockMovements.$inferInsert, tx?: DbTransaction) {
    const [newMovement] = await this.getClient(tx)
      .insert(stockMovements)
      .values(data)
      .returning();
    return newMovement;
  }

  async recordMovementAndUpdateStock(data: typeof stockMovements.$inferInsert) {
    return await this.db.transaction(async (tx) => {
      const [newMovement] = await tx
        .insert(stockMovements)
        .values(data)
        .returning();

      await tx
        .update(products)
        .set({
          stockQuantity: sql`${products.stockQuantity} + ${data.quantity}`,
          updatedAt: new Date(),
        })
        .where(this.withTenant(products, data.businessUnitId, eq(products.id, data.productId)));

      return newMovement;
    });
  }

  async findAll(
    tenantId: string,
    pagination: PaginationDto,
    tx?: DbTransaction,
  ) {
    const { page, limit, offset } = getPaginationParams(pagination);

    const db = this.getClient(tx);
    const whereCondition = this.withTenant(stockMovements, tenantId);

    const [data, totalResults] = await Promise.all([
      db.query.stockMovements.findMany({
        where: whereCondition,
        with: {
          product: true,
          user: {
            columns: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        limit,
        offset,
        orderBy: (movements, { desc }) => [desc(movements.createdAt)],
      }),
      db.select({ values: count() }).from(stockMovements).where(whereCondition),
    ]);

    return buildPaginatedResponse(data, totalResults[0].values, page, limit);
  }
}
