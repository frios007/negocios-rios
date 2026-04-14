import { Injectable } from '@nestjs/common';
import { Database, DbTransaction } from '@/core/database/database.provider';
import { client } from '@/core/database/schemas/sales/sales.tables';
import { eq, count, sql } from 'drizzle-orm';
import { PaginationDto } from '@/core/dto/pagination.dto';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '@/core/common/utils/pagination.utils';

@Injectable()
export class ClientsRepository extends Database {
  async create(data: typeof client.$inferInsert, tx?: DbTransaction) {
    const [newClient] = await this.getClient(tx)
      .insert(client)
      .values(data)
      .returning();
    return newClient;
  }

  async findAllActive(
    tenantId: string,
    pagination: PaginationDto,
    tx?: DbTransaction,
  ) {
    const { page, limit, offset } = getPaginationParams(pagination);

    const db = this.getClient(tx);
    const whereCondition = this.withTenant(
      client,
      tenantId,
      eq(client.isActive, true),
    );

    const [data, totalResult] = await Promise.all([
      db.query.client.findMany({
        where: whereCondition,
        orderBy: (clients, { asc }) => [asc(clients.firstName)],
        limit: limit,
        offset: offset,
      }),
      db.select({ value: count() }).from(client).where(whereCondition),
    ]);

    return buildPaginatedResponse(data, totalResult[0].value, page, limit);
  }

  async findById(id: string, tenantId: string, tx?: DbTransaction) {
    return this.getClient(tx).query.client.findFirst({
      where: this.withTenant(client, tenantId, eq(client.id, id)),
    });
  }

  async findOptions(tenantId: string, tx?: DbTransaction) {
    return this.getClient(tx).query.client.findMany({
      where: this.withTenant(client, tenantId, eq(client.isActive, true)),
      columns: { id: true, firstName: true, lastName: true, creditLimit: true, balanceDue: true },
      orderBy: (clients, { asc }) => [asc(clients.firstName)],
    });
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<typeof client.$inferInsert>,
    tx?: DbTransaction,
  ) {
    const [updatedClient] = await this.getClient(tx)
      .update(client)
      .set({ ...data, updatedAt: new Date() })
      .where(this.withTenant(client, tenantId, eq(client.id, id)))
      .returning();
    return updatedClient;
  }

  async softDelete(id: string, tenantId: string, tx?: DbTransaction) {
    const [deletedClient] = await this.getClient(tx)
      .update(client)
      .set({ isActive: false, updatedAt: new Date() })
      .where(this.withTenant(client, tenantId, eq(client.id, id)))
      .returning();
    return deletedClient;
  }

  async incrementBalanceDue(
    id: string,
    amount: number,
    tenantId: string,
    tx?: DbTransaction,
  ) {
    const [updatedClient] = await this.getClient(tx)
      .update(client)
      .set({
        balanceDue: sql`${client.balanceDue} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(this.withTenant(client, tenantId, eq(client.id, id)))
      .returning();
    return updatedClient;
  }

  async decrementBalanceDue(
    id: string,
    amount: number,
    tenantId: string,
    tx?: DbTransaction,
  ) {
    const [updatedClient] = await this.getClient(tx)
      .update(client)
      .set({
        balanceDue: sql`${client.balanceDue} - ${amount}`,
        updatedAt: new Date(),
      })
      .where(this.withTenant(client, tenantId, eq(client.id, id)))
      .returning();
    return updatedClient;
  }
}
