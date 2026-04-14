import { Inject, Injectable } from '@nestjs/common';
import { eq, and, count, ilike, or } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/core/database/database-connection';
import { type DbClient } from '@/core/database/database.provider';
import { patients } from '@/core/database/schemas/clinical';
import { buildPaginatedResponse } from '@/core/common/utils/pagination.utils';

@Injectable()
export class PatientsRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: DbClient,
  ) {}

  async findAll(
    tenantId: string,
    pagination: { page: number; limit: number },
    search?: string,
  ) {
    const conditions = [eq(patients.businessUnitId, tenantId)];

    const query = this.db.query.patients.findMany({
      where: and(...conditions),
      with: {
        client: { columns: { firstName: true, lastName: true, id: true } },
      },
      orderBy: (p, { desc }) => [desc(p.createdAt)],
      limit: pagination.limit,
      offset: (pagination.page - 1) * pagination.limit,
    });

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(patients)
      .where(and(...conditions));

    const items = await query;

    return buildPaginatedResponse(items, totalResult?.count ?? 0, pagination.page, pagination.limit);
  }

  async findOptions(tenantId: string) {
    return this.db.query.patients.findMany({
      where: and(
        eq(patients.businessUnitId, tenantId),
        eq(patients.isActive, true),
      ),
      columns: { id: true, name: true, species: true },
      with: {
        client: { columns: { firstName: true, lastName: true } },
      },
      orderBy: (p, { asc }) => [asc(p.name)],
    });
  }

  async findById(id: string, tenantId: string) {
    return this.db.query.patients.findFirst({
      where: and(eq(patients.id, id), eq(patients.businessUnitId, tenantId)),
      with: {
        client: { columns: { id: true, firstName: true, lastName: true, phoneNumber: true } },
        clinicalRecords: {
          with: { vet: { columns: { firstName: true, lastName: true } } },
          orderBy: (r, { desc }) => [desc(r.createdAt)],
          limit: 20,
        },
        hospitalizations: {
          orderBy: (h, { desc }) => [desc(h.createdAt)],
          limit: 10,
        },
      },
    });
  }

  async create(data: typeof patients.$inferInsert) {
    const [result] = await this.db.insert(patients).values(data).returning();
    return result;
  }

  async update(id: string, tenantId: string, data: Partial<typeof patients.$inferInsert>) {
    const [result] = await this.db
      .update(patients)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(patients.id, id), eq(patients.businessUnitId, tenantId)))
      .returning();
    return result;
  }
}
