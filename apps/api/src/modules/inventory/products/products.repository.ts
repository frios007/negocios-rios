import { Injectable } from '@nestjs/common';
import { Database, DbTransaction } from '@/core/database/database.provider';
import { products } from '@/core/database/schemas/inventory/inventory.tables';
import { eq, count, sql, and } from 'drizzle-orm';
import { PaginationDto } from '@/core/dto/pagination.dto';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '@/core/common/utils/pagination.utils';

@Injectable()
export class ProductsRepository extends Database {
  async create(data: typeof products.$inferInsert, tx?: DbTransaction) {
    const [newProduct] = await this.getClient(tx)
      .insert(products)
      .values(data)
      .returning();
    return newProduct;
  }

  async findAllActive(
    tenatId: string,
    pagination: PaginationDto,
    tx?: DbTransaction,
  ) {
    const { page, limit, offset } = getPaginationParams(pagination);

    const db = this.getClient(tx);
    const whereCondition = this.withTenant(
      products,
      tenatId,
      eq(products.isActive, true),
    );

    const [data, totalResult] = await Promise.all([
      db.query.products.findMany({
        where: whereCondition,
        with: { category: true, supplier: true },
        orderBy: (products, { asc }) => [asc(products.name)],
        limit: limit,
        offset: offset,
      }),
      db.select({ value: count() }).from(products).where(whereCondition),
    ]);

    return buildPaginatedResponse(data, totalResult[0].value, page, limit);
  }

  async findById(id: string, tenantId: string, tx?: DbTransaction) {
    return this.getClient(tx).query.products.findFirst({
      where: this.withTenant(products, tenantId, eq(products.id, id)),
      with: { category: true, supplier: true },
    });
  }

  async findOptions(tenantId: string, tx?: DbTransaction) {
    return this.getClient(tx).query.products.findMany({
      where: this.withTenant(products, tenantId, eq(products.isActive, true)),
      columns: { id: true, name: true },
      orderBy: (products, { asc }) => [asc(products.name)],
    });
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<typeof products.$inferInsert>,
    tx?: DbTransaction,
  ) {
    const [updatedProduct] = await this.getClient(tx)
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(this.withTenant(products, tenantId, eq(products.id, id)))
      .returning();
    return updatedProduct;
  }

  async softDelete(id: string, tenantId: string, tx?: DbTransaction) {
    const [deletedProduct] = await this.getClient(tx)
      .update(products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(this.withTenant(products, tenantId, eq(products.id, id)))
      .returning();
    return deletedProduct;
  }

  async decrementStock(id: string, quantity: number, tenantId: string, tx?: DbTransaction) {
    const [updatedProduct] = await this.getClient(tx)
      .update(products)
      .set({
        stockQuantity: sql`${products.stockQuantity} - ${Math.abs(quantity)}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          this.withTenant(products, tenantId, eq(products.id, id)),
          sql`${products.stockQuantity} >= ${Math.abs(quantity)}`,
        ),
      )
      .returning();
    return updatedProduct;
  }

  async incrementStock(id: string, quantity: number, tenantId: string, tx?: DbTransaction) {
    const [updatedProduct] = await this.getClient(tx)
      .update(products)
      .set({
        stockQuantity: sql`${products.stockQuantity} + ${Math.abs(quantity)}`,
        updatedAt: new Date(),
      })
      .where(this.withTenant(products, tenantId, eq(products.id, id)))
      .returning();
    return updatedProduct;
  }
}

