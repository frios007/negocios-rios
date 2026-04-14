import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ActiveTenant } from '@/core/decorators/tenant.decorator';
import { ResponseMessage } from '@/core/decorators/response-message.decorator';
import { PaginationDto } from '@/core/dto/pagination.dto';

@Controller('sales/clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ResponseMessage('Client registered successfully')
  async create(
    @Body() createClientDto: CreateClientDto,
    @ActiveTenant() tenantId: string,
  ) {
    return this.clientsService.create(createClientDto, tenantId);
  }

  @Get()
  @ResponseMessage('Clients retrieved successfully')
  async findAll(
    @ActiveTenant() tenantId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.clientsService.findAllActive(tenantId, pagination);
  }

  @Get('options')
  @ResponseMessage('Client options retrieved successfully')
  async findOptions(@ActiveTenant() tenantId: string) {
    return this.clientsService.findOptions(tenantId);
  }

  @Get(':id')
  @ResponseMessage('Client retrieved successfully')
  async findOne(@Param('id') id: string, @ActiveTenant() tenantId: string) {
    return this.clientsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @ResponseMessage('Client updated successfully')
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @ActiveTenant() tenantId: string,
  ) {
    return this.clientsService.update(id, updateClientDto, tenantId);
  }

  @Delete(':id')
  @ResponseMessage('Client deleted successfully')
  async remove(@Param('id') id: string, @ActiveTenant() tenantId: string) {
    return this.clientsService.remove(id, tenantId);
  }
}
