import { Injectable, Inject } from '@nestjs/common';
import { Database, DbTransaction } from '@/core/database/database.provider';
import { DATABASE_CONNECTION } from '@/core/database/database-connection';
import { type DbClient } from '@/core/database/database.provider';
import { eq, and, sql, count, gte, lte, desc } from 'drizzle-orm';
import { GetSalesDto } from './dto/get-sales.dto';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '@/core/common/utils/pagination.utils';
import {
  sales,
  salesDetails,
  payments,
  SaleStatus,
  PaymentStatus,
} from '@/core/database/schemas/sales/sales.tables';

@Injectable()
export class SalesRepository extends Database {
  constructor(@Inject(DATABASE_CONNECTION) db: DbClient) {
    super(db);
  }

  async createSale(data: typeof sales.$inferInsert, tx?: DbTransaction) {
    const [newSale] = await this.getClient(tx).insert(sales).values(data).returning();
    return newSale;
  }

  async createSaleDetails(
    data: (typeof salesDetails.$inferInsert)[],
    tx?: DbTransaction,
  ) {
    return await this.getClient(tx).insert(salesDetails).values(data).returning();
  }

  async createPayment(data: typeof payments.$inferInsert, tx?: DbTransaction) {
    const [newPayment] = await this.getClient(tx).insert(payments).values(data).returning();
    return newPayment;
  }

  async findAllSales(tenantId: string, filters: GetSalesDto, tx?: DbTransaction) {
    const { page, limit, offset } = getPaginationParams(filters);
    const db = this.getClient(tx);

    let whereCondition = this.withTenant(sales, tenantId);

    if (filters.paymentStatus) {
      whereCondition = and(whereCondition, eq(sales.paymentStatus, filters.paymentStatus));
    }
    if (filters.clientId) {
      whereCondition = and(whereCondition, eq(sales.clientId, filters.clientId));
    }
    if (filters.userId) {
      whereCondition = and(whereCondition, eq(sales.userId, filters.userId));
    }
    if (filters.startDate) {
      whereCondition = and(whereCondition, gte(sales.createdAt, new Date(filters.startDate)));
    }
    if (filters.endDate) {
      whereCondition = and(whereCondition, lte(sales.createdAt, new Date(filters.endDate)));
    }

    const [data, totalResult] = await Promise.all([
      db.query.sales.findMany({
        where: whereCondition,
        with: {
          client: true,
          user: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
            },
          },
        },
        limit,
        offset,
        orderBy: (sales, { desc }) => [desc(sales.createdAt)],
      }),
      db.select({ value: count() }).from(sales).where(whereCondition),
    ]);

    return buildPaginatedResponse(data, totalResult[0].value, page, limit);
  }

  async findByIdWithDetails(id: string, tenantId: string, tx?: DbTransaction) {
    const sale = await this.getClient(tx).query.sales.findFirst({
      where: this.withTenant(sales, tenantId, eq(sales.id, id)),
      with: {
        client: true,
        user: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });

    if (!sale) return null;

    // Fetch details manually since relations might not be explicitly tied in the Drizzle schema DTOs
    const db = this.getClient(tx);
    const details = await db.query.salesDetails.findMany({
       where: and(eq(salesDetails.saleId, sale.id), eq(salesDetails.businessUnitId, tenantId)),
       with: {
         product: true,
       }
    }).catch(async () => {
      // Fallback if relation `product` is not mapped in Drizzle
      const rawDetails = await db.select().from(salesDetails).where(and(eq(salesDetails.saleId, sale.id), eq(salesDetails.businessUnitId, tenantId)));
      return rawDetails; 
    });

    const salePayments = await db.select().from(payments).where(and(eq(payments.saleId, sale.id), eq(payments.businessUnitId, tenantId)));

    return { ...sale, details, payments: salePayments };
  }

  async updateSaleStatus(id: string, status: SaleStatus, tenantId: string, tx?: DbTransaction) {
    const [updatedSale] = await this.getClient(tx)
      .update(sales)
      .set({ status })
      .where(this.withTenant(sales, tenantId, eq(sales.id, id)))
      .returning();
    return updatedSale;
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus, tenantId: string, tx?: DbTransaction) {
    const [updatedSale] = await this.getClient(tx)
      .update(sales)
      .set({ paymentStatus })
      .where(this.withTenant(sales, tenantId, eq(sales.id, id)))
      .returning();
    return updatedSale;
  }
}
