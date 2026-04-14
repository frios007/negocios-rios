import { Injectable, NotFoundException } from '@nestjs/common';
import { PatientsRepository } from './patients.repository';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private readonly patientsRepo: PatientsRepository) {}

  async findAll(
    tenantId: string,
    pagination: { page: number; limit: number },
    search?: string,
  ) {
    return this.patientsRepo.findAll(tenantId, pagination, search);
  }

  async findOptions(tenantId: string) {
    return this.patientsRepo.findOptions(tenantId);
  }

  async findById(id: string, tenantId: string) {
    const patient = await this.patientsRepo.findById(id, tenantId);
    if (!patient) throw new NotFoundException('Paciente no encontrado');
    return patient;
  }

  async create(dto: CreatePatientDto, tenantId: string) {
    return this.patientsRepo.create({
      ...dto,
      businessUnitId: tenantId,
    });
  }

  async update(id: string, dto: UpdatePatientDto, tenantId: string) {
    const existing = await this.patientsRepo.findById(id, tenantId);
    if (!existing) throw new NotFoundException('Paciente no encontrado');
    return this.patientsRepo.update(id, tenantId, dto);
  }

  async deactivate(id: string, tenantId: string) {
    const existing = await this.patientsRepo.findById(id, tenantId);
    if (!existing) throw new NotFoundException('Paciente no encontrado');
    return this.patientsRepo.update(id, tenantId, { isActive: false });
  }
}
