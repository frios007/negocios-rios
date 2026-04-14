import { Injectable } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SuppliersRepository } from './suppliers.repository';
import { NotFoundException } from '@nestjs/common';
import { PaginationDto } from '@/core/dto/pagination.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly suppliersRepository: SuppliersRepository) {}

  async create(createSupplierDto: CreateSupplierDto, tenantId: string) {
    return this.suppliersRepository.create({
      ...createSupplierDto,
      businessUnitId: tenantId,
    });
  }

  async findAll(tenantId: string, pagination: PaginationDto) {
    return this.suppliersRepository.findAll(tenantId, pagination);
  }

  async findOne(id: string, tenantId: string) {
    const supplier = await this.suppliersRepository.findById(id, tenantId);
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async findOptions(tenantId: string) {
    return this.suppliersRepository.findOptions(tenantId);
  }

  async update(
    id: string,
    tenantId: string,
    updateSupplierDto: UpdateSupplierDto,
  ) {
    await this.findOne(id, tenantId);

    return this.suppliersRepository.update(id, tenantId, updateSupplierDto);
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.suppliersRepository.remove(id, tenantId);
  }
}
