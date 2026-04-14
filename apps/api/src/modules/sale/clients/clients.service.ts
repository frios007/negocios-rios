import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientsRepository } from './clients.repository';
import { PaginationDto } from '@/core/dto/pagination.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly clientsRepo: ClientsRepository) {}

  create(createClientDto: CreateClientDto, tenantId: string) {
    return this.clientsRepo.create({
      ...createClientDto,
      creditLimit: createClientDto.creditLimit.toFixed(2),
      businessUnitId: tenantId,
    });
  }

  findAllActive(tenantId: string, pagination: PaginationDto) {
    return this.clientsRepo.findAllActive(tenantId, pagination);
  }

  async findOne(id: string, tenantId: string) {
    const client = await this.clientsRepo.findById(id, tenantId);
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async findOptions(tenantId: string) {
    return this.clientsRepo.findOptions(tenantId);
  }

  async update(id: string, updateClientDto: UpdateClientDto, tenantId: string) {
    await this.findOne(id, tenantId);
    const { creditLimit, ...rest } = updateClientDto;
    const data = {
      ...rest,
      ...(creditLimit !== undefined && { creditLimit: creditLimit.toFixed(2) }),
    };
    return this.clientsRepo.update(id, tenantId, data);
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.clientsRepo.softDelete(id, tenantId);
  }
}
