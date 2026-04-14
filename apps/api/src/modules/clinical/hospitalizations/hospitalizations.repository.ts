import { Inject, Injectable } from '@nestjs/common';
import { eq, and, count, desc } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/core/database/database-connection';
import { type DbClient } from '@/core/database/database.provider';
import {
  hospitalizations,
  hospitalizationNotes,
  hospitalizationItems,
  clinicalRecords,
} from '@/core/database/schemas/clinical';
import { buildPaginatedResponse } from '@/core/common/utils/pagination.utils';

@Injectable()
export class HospitalizationsRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: DbClient,
  ) {}

  async findAll(
    tenantId: string,
    pagination: { page: number; limit: number },
    statusFilter?: string,
  ) {
    const conditions: any[] = [
      eq(hospitalizations.businessUnitId, tenantId),
    ];
    if (statusFilter) {
      conditions.push(eq(hospitalizations.status, statusFilter as any));
    }

    const items = await this.db.query.hospitalizations.findMany({
      where: and(...conditions),
      with: {
        patient: {
          columns: { id: true, name: true, species: true, breed: true },
          with: {
            client: {
              columns: { id: true, firstName: true, lastName: true },
            },
          },
        },
        vet: { columns: { firstName: true, lastName: true } },
        notes: {
          orderBy: [desc(hospitalizationNotes.createdAt)],
          limit: 1,
        },
      },
      orderBy: [desc(hospitalizations.createdAt)],
      limit: pagination.limit,
      offset: (pagination.page - 1) * pagination.limit,
    });

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(hospitalizations)
      .where(and(...conditions));

    return buildPaginatedResponse(items, totalResult?.count ?? 0, pagination.page, pagination.limit);
  }

  async findById(id: string, tenantId: string) {
    return this.db.query.hospitalizations.findFirst({
      where: and(
        eq(hospitalizations.id, id),
        eq(hospitalizations.businessUnitId, tenantId),
      ),
      with: {
        patient: {
          with: {
            client: {
              columns: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
              },
            },
          },
        },
        vet: { columns: { id: true, firstName: true, lastName: true } },
        notes: {
          with: { vet: { columns: { firstName: true, lastName: true } } },
          orderBy: [desc(hospitalizationNotes.createdAt)],
        },
        items: {
          orderBy: [desc(hospitalizationItems.createdAt)],
        },
        sale: true,
      },
    });
  }

  async create(data: typeof hospitalizations.$inferInsert) {
    const [result] = await this.db
      .insert(hospitalizations)
      .values(data)
      .returning();
    return result;
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<typeof hospitalizations.$inferInsert>,
  ) {
    const [result] = await this.db
      .update(hospitalizations)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(hospitalizations.id, id),
          eq(hospitalizations.businessUnitId, tenantId),
        ),
      )
      .returning();
    return result;
  }

  async addNote(data: typeof hospitalizationNotes.$inferInsert) {
    const [result] = await this.db
      .insert(hospitalizationNotes)
      .values(data)
      .returning();
    return result;
  }

  async addItem(data: typeof hospitalizationItems.$inferInsert) {
    const [result] = await this.db
      .insert(hospitalizationItems)
      .values(data)
      .returning();
    return result;
  }

  async getItems(hospitalizationId: string) {
    return this.db.query.hospitalizationItems.findMany({
      where: eq(hospitalizationItems.hospitalizationId, hospitalizationId),
    });
  }

  async createClinicalRecord(data: typeof clinicalRecords.$inferInsert) {
    const [result] = await this.db
      .insert(clinicalRecords)
      .values(data)
      .returning();
    return result;
  }
}
