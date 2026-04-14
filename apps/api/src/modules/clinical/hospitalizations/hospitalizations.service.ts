import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { DATABASE_CONNECTION } from '@/core/database/database-connection';
import { type DbClient } from '@/core/database/database.provider';
import { HospitalizationsRepository } from './hospitalizations.repository';
import { SalesRepository } from '@/modules/sale/sales/sales.repository';
import {
  CreateHospitalizationDto,
  DischargeHospitalizationDto,
  AddNoteDto,
  AddItemDto,
  UpdateHospitalizationDto,
  GenerateBillDto,
} from './dto/hospitalization.dto';

@Injectable()
export class HospitalizationsService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: DbClient,
    private readonly hospRepo: HospitalizationsRepository,
    private readonly salesRepo: SalesRepository,
  ) {}

  async findAll(
    tenantId: string,
    pagination: { page: number; limit: number },
    status?: string,
  ) {
    return this.hospRepo.findAll(tenantId, pagination, status);
  }

  async findById(id: string, tenantId: string) {
    const hosp = await this.hospRepo.findById(id, tenantId);
    if (!hosp) throw new NotFoundException('Hospitalización no encontrada');
    return hosp;
  }

  async create(
    dto: CreateHospitalizationDto,
    tenantId: string,
    vetId: string,
  ) {
    // Create the hospitalization
    const hosp = await this.hospRepo.create({
      patientId: dto.patientId,
      vetId,
      reason: dto.reason,
      diagnosis: dto.diagnosis,
      estimatedDays: dto.estimatedDays,
      dailyRate: dto.dailyRate,
      businessUnitId: tenantId,
    });

    // Create an initial clinical record linked to the hospitalization
    await this.hospRepo.createClinicalRecord({
      patientId: dto.patientId,
      vetId,
      reason: `Ingreso: ${dto.reason}`,
      weight: dto.weight,
      temperature: dto.temperature,
      status: 'ADMITTED',
      hospitalizationId: hosp.id,
      businessUnitId: tenantId,
    });

    return hosp;
  }

  async update(
    id: string,
    dto: UpdateHospitalizationDto,
    tenantId: string,
  ) {
    const existing = await this.hospRepo.findById(id, tenantId);
    if (!existing) throw new NotFoundException('Hospitalización no encontrada');
    if (existing.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Solo se pueden editar hospitalizaciones activas',
      );
    }
    return this.hospRepo.update(id, tenantId, dto);
  }

  async discharge(
    id: string,
    dto: DischargeHospitalizationDto,
    tenantId: string,
    vetId: string,
  ) {
    const existing = await this.hospRepo.findById(id, tenantId);
    if (!existing) throw new NotFoundException('Hospitalización no encontrada');
    if (existing.status !== 'ACTIVE') {
      throw new BadRequestException('Esta hospitalización ya fue finalizada');
    }

    // Create discharge clinical record
    await this.hospRepo.createClinicalRecord({
      patientId: existing.patientId,
      vetId,
      reason: `Alta: ${existing.reason}`,
      diagnosis: dto.dischargeNotes || 'Paciente dado de alta',
      status: 'DISCHARGED',
      hospitalizationId: id,
      businessUnitId: tenantId,
    });

    return this.hospRepo.update(id, tenantId, {
      status: 'DISCHARGED',
      dischargedAt: new Date(),
      dischargeNotes: dto.dischargeNotes,
    });
  }

  async addNote(
    id: string,
    dto: AddNoteDto,
    tenantId: string,
    vetId: string,
  ) {
    const existing = await this.hospRepo.findById(id, tenantId);
    if (!existing) throw new NotFoundException('Hospitalización no encontrada');
    if (existing.status !== 'ACTIVE') {
      throw new BadRequestException(
        'No se pueden agregar notas a una hospitalización finalizada',
      );
    }
    return this.hospRepo.addNote({
      hospitalizationId: id,
      vetId,
      ...dto,
    });
  }

  async addItem(id: string, dto: AddItemDto, tenantId: string) {
    const existing = await this.hospRepo.findById(id, tenantId);
    if (!existing) throw new NotFoundException('Hospitalización no encontrada');
    if (existing.status !== 'ACTIVE') {
      throw new BadRequestException(
        'No se pueden agregar items a una hospitalización finalizada',
      );
    }
    return this.hospRepo.addItem({
      hospitalizationId: id,
      ...dto,
    });
  }

  async generateBill(
    id: string,
    dto: GenerateBillDto,
    tenantId: string,
    userId: string,
  ) {
    const hosp = await this.hospRepo.findById(id, tenantId);
    if (!hosp) throw new NotFoundException('Hospitalización no encontrada');
    if (hosp.saleId) {
      throw new BadRequestException(
        'Esta hospitalización ya tiene una factura generada',
      );
    }

    // Calculate days stayed
    const admittedAt = new Date(hosp.admittedAt);
    const discharged = hosp.dischargedAt
      ? new Date(hosp.dischargedAt)
      : new Date();
    const daysStayed = Math.max(
      1,
      Math.ceil(
        (discharged.getTime() - admittedAt.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );

    let total = new Decimal(0);

    // Daily rate charges
    if (hosp.dailyRate) {
      total = total.plus(new Decimal(hosp.dailyRate).times(daysStayed));
    }

    // Individual items
    const items = await this.hospRepo.getItems(id);
    for (const item of items) {
      total = total.plus(
        new Decimal(item.unitPrice).times(item.quantity),
      );
    }

    if (total.isZero()) {
      throw new BadRequestException(
        'No hay cargos registrados para facturar. Establece una tarifa diaria o agrega items.',
      );
    }

    // Get client from the patient's owner
    const clientId = hosp.patient?.clientId ?? null;

    // Create the sale through existing sales infrastructure
    return await this.db.transaction(async (tx) => {
      const sale = await this.salesRepo.createSale(
        {
          clientId,
          userId,
          subTotal: total.toFixed(2),
          discountAmount: '0.00',
          totalAmount: total.toFixed(2),
          paymentMethod: dto.paymentMethod,
          paymentStatus: dto.paymentMethod === 'CREDIT' ? 'PENDING' : 'PAID',
          businessUnitId: tenantId,
        },
        tx,
      );

      // Create a payment record if not credit
      if (dto.paymentMethod !== 'CREDIT') {
        await this.salesRepo.createPayment(
          {
            saleId: sale.id,
            clientId,
            userId,
            amount: total.toFixed(2),
            paymentMethod: dto.paymentMethod,
            businessUnitId: tenantId,
          },
          tx,
        );
      }

      // Link the sale back to the hospitalization
      await this.hospRepo.update(id, tenantId, { saleId: sale.id });

      return { sale, total: total.toFixed(2), daysStayed, itemsCount: items.length };
    });
  }
}
