import { Inject, Injectable } from '@nestjs/common';
import { eq, and, count, desc } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/core/database/database-connection';
import { type DbClient } from '@/core/database/database.provider';
import { clinicalRecords } from '@/core/database/schemas/clinical';
import { buildPaginatedResponse } from '@/core/common/utils/pagination.utils';

@Injectable()
export class RecordsRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: DbClient,
  ) {}

  async findAll(
    tenantId: string,
    pagination: { page: number; limit: number },
  ) {
    const items = await this.db.query.clinicalRecords.findMany({
      where: eq(clinicalRecords.businessUnitId, tenantId),
      with: {
        patient: {
          columns: { id: true, name: true, species: true },
          with: { client: { columns: { firstName: true, lastName: true } } },
        },
        vet: { columns: { firstName: true, lastName: true } },
      },
      orderBy: [desc(clinicalRecords.createdAt)],
      limit: pagination.limit,
      offset: (pagination.page - 1) * pagination.limit,
    });

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(clinicalRecords)
      .where(eq(clinicalRecords.businessUnitId, tenantId));

    return buildPaginatedResponse(items, totalResult?.count ?? 0, pagination.page, pagination.limit);
  }

  async findById(id: string, tenantId: string) {
    return this.db.query.clinicalRecords.findFirst({
      where: and(
        eq(clinicalRecords.id, id),
        eq(clinicalRecords.businessUnitId, tenantId),
      ),
      with: {
        patient: {
          with: { client: { columns: { id: true, firstName: true, lastName: true } } },
        },
        vet: { columns: { id: true, firstName: true, lastName: true } },
        hospitalization: true,
      },
    });
  }

  async create(data: typeof clinicalRecords.$inferInsert) {
    const [result] = await this.db
      .insert(clinicalRecords)
      .values(data)
      .returning();
    return result;
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<typeof clinicalRecords.$inferInsert>,
  ) {
    const [result] = await this.db
      .update(clinicalRecords)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(clinicalRecords.id, id),
          eq(clinicalRecords.businessUnitId, tenantId),
        ),
      )
      .returning();
    return result;
  }
}
