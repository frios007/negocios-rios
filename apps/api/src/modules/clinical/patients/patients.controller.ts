import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { ActiveTenant } from '@/core/decorators/tenant.decorator';
import { ResponseMessage } from '@/core/decorators/response-message.decorator';

@Controller('clinical/patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @ResponseMessage('Patients retrieved successfully')
  async findAll(
    @ActiveTenant() tenantId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '200',
    @Query('search') search?: string,
  ) {
    return this.patientsService.findAll(
      tenantId,
      { page: +page, limit: +limit },
      search,
    );
  }

  @Get('options')
  @ResponseMessage('Patient options retrieved successfully')
  async findOptions(@ActiveTenant() tenantId: string) {
    return this.patientsService.findOptions(tenantId);
  }

  @Get(':id')
  @ResponseMessage('Patient retrieved successfully')
  async findById(
    @Param('id') id: string,
    @ActiveTenant() tenantId: string,
  ) {
    return this.patientsService.findById(id, tenantId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Patient created successfully')
  async create(
    @Body() dto: CreatePatientDto,
    @ActiveTenant() tenantId: string,
  ) {
    return this.patientsService.create(dto, tenantId);
  }

  @Patch(':id')
  @ResponseMessage('Patient updated successfully')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
    @ActiveTenant() tenantId: string,
  ) {
    return this.patientsService.update(id, dto, tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Patient deactivated successfully')
  async deactivate(
    @Param('id') id: string,
    @ActiveTenant() tenantId: string,
  ) {
    return this.patientsService.deactivate(id, tenantId);
  }
}
