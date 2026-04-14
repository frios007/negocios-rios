import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RecordsRepository } from './records.repository';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';

@Injectable()
export class RecordsService {
  constructor(private readonly recordsRepo: RecordsRepository) {}

  async findAll(
    tenantId: string,
    pagination: { page: number; limit: number },
  ) {
    return this.recordsRepo.findAll(tenantId, pagination);
  }

  async findById(id: string, tenantId: string) {
    const record = await this.recordsRepo.findById(id, tenantId);
    if (!record) throw new NotFoundException('Registro clínico no encontrado');
    return record;
  }

  async create(dto: CreateRecordDto, tenantId: string, vetId: string) {
    return this.recordsRepo.create({
      ...dto,
      vetId,
      businessUnitId: tenantId,
    });
  }

  async update(id: string, dto: UpdateRecordDto, tenantId: string) {
    const existing = await this.recordsRepo.findById(id, tenantId);
    if (!existing)
      throw new NotFoundException('Registro clínico no encontrado');

    if (
      existing.status === 'DISCHARGED' ||
      existing.status === 'CANCELLED'
    ) {
      throw new BadRequestException(
        'No se puede modificar un registro finalizado o cancelado',
      );
    }

    return this.recordsRepo.update(id, tenantId, dto);
  }
}
