import { Injectable } from '@nestjs/common';
import { Database, DbTransaction } from '@/core/database/database.provider';
import { users, userBusinessUnits } from '@/core/database/schemas/core/core.tables';
import { eq, and, sql, count } from 'drizzle-orm';
import type { UserRole } from '@/core/database/schemas/core/core.tables';

@Injectable()
export class UsersRepository extends Database {
  async findForLogin(username: string, tx?: DbTransaction) {
    const client = this.getClient(tx);

    return client.query.users.findFirst({
      where: eq(users.username, username),
      with: {
        userBusinessUnits: {
          with: {
            businessUnit: true,
          },
        },
      },
    });
  }

  async findById(id: string, tx?: DbTransaction) {
    const client = this.getClient(tx);

    return client.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  async findByIdWithBusinessUnits(id: string, tx?: DbTransaction) {
    const client = this.getClient(tx);

    return client.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        userBusinessUnits: {
          with: {
            businessUnit: true,
          },
        },
      },
    });
  }

  async findByUsername(username: string, tx?: DbTransaction) {
    const client = this.getClient(tx);

    return client.query.users.findFirst({
      where: eq(users.username, username),
    });
  }

  async findAllByTenant(
    tenantId: string,
    pagination: { page: number; limit: number },
    tx?: DbTransaction,
  ) {
    const client = this.getClient(tx);
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    // Get users that belong to this tenant
    const results = await client.query.userBusinessUnits.findMany({
      where: eq(userBusinessUnits.businessUnitId, tenantId),
      with: {
        user: true,
      },
      limit,
      offset,
    });

    // Count total
    const [totalResult] = await client
      .select({ count: count() })
      .from(userBusinessUnits)
      .where(eq(userBusinessUnits.businessUnitId, tenantId));

    const total = totalResult?.count ?? 0;

    // Map to flat user objects with role
    const items = results.map((r) => ({
      ...r.user,
      role: r.role,
    }));

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(
    data: {
      username: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      passwordHash: string;
    },
    tx?: DbTransaction,
  ) {
    const [user] = await this.getClient(tx)
      .insert(users)
      .values(data)
      .returning();
    return user;
  }

  async update(
    id: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      phoneNumber: string;
      isActive: boolean;
    }>,
    tx?: DbTransaction,
  ) {
    const [updated] = await this.getClient(tx)
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async updatePasswordHash(id: string, newHash: string, tx?: DbTransaction) {
    const [updatedUser] = await this.getClient(tx)
      .update(users)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async assignToBusinessUnit(
    userId: string,
    businessUnitId: string,
    role: UserRole,
    tx?: DbTransaction,
  ) {
    const [result] = await this.getClient(tx)
      .insert(userBusinessUnits)
      .values({ userId, businessUnitId, role })
      .returning();
    return result;
  }

  async unassignFromBusinessUnit(
    userId: string,
    businessUnitId: string,
    tx?: DbTransaction,
  ) {
    await this.getClient(tx)
      .delete(userBusinessUnits)
      .where(
        and(
          eq(userBusinessUnits.userId, userId),
          eq(userBusinessUnits.businessUnitId, businessUnitId),
        ),
      );
  }

  async updateRole(
    userId: string,
    businessUnitId: string,
    role: UserRole,
    tx?: DbTransaction,
  ) {
    const [updated] = await this.getClient(tx)
      .update(userBusinessUnits)
      .set({ role })
      .where(
        and(
          eq(userBusinessUnits.userId, userId),
          eq(userBusinessUnits.businessUnitId, businessUnitId),
        ),
      )
      .returning();
    return updated;
  }

  async countOwnersInBU(businessUnitId: string, tx?: DbTransaction) {
    const [result] = await this.getClient(tx)
      .select({ count: count() })
      .from(userBusinessUnits)
      .where(
        and(
          eq(userBusinessUnits.businessUnitId, businessUnitId),
          eq(userBusinessUnits.role, 'OWNER'),
        ),
      );
    return result?.count ?? 0;
  }

  async findUserBusinessUnit(
    userId: string,
    businessUnitId: string,
    tx?: DbTransaction,
  ) {
    return this.getClient(tx).query.userBusinessUnits.findFirst({
      where: and(
        eq(userBusinessUnits.userId, userId),
        eq(userBusinessUnits.businessUnitId, businessUnitId),
      ),
    });
  }
}
