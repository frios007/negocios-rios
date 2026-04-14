import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HospitalizationsService } from './hospitalizations.service';
import {
  CreateHospitalizationDto,
  DischargeHospitalizationDto,
  AddNoteDto,
  AddItemDto,
  UpdateHospitalizationDto,
  GenerateBillDto,
} from './dto/hospitalization.dto';
import { ActiveTenant } from '@/core/decorators/tenant.decorator';
import { CurrentUser } from '@/core/decorators/user.decorator';
import { ResponseMessage } from '@/core/decorators/response-message.decorator';

@Controller('clinical/hospitalizations')
export class HospitalizationsController {
  constructor(
    private readonly hospService: HospitalizationsService,
  ) {}

  @Get()
  @ResponseMessage('Hospitalizations retrieved successfully')
  async findAll(
    @ActiveTenant() tenantId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('status') status?: string,
  ) {
    return this.hospService.findAll(
      tenantId,
      { page: +page, limit: +limit },
      status,
    );
  }

  @Get(':id')
  @ResponseMessage('Hospitalization retrieved successfully')
  async findById(
    @Param('id') id: string,
    @ActiveTenant() tenantId: string,
  ) {
    return this.hospService.findById(id, tenantId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Patient admitted successfully')
  async create(
    @Body() dto: CreateHospitalizationDto,
    @ActiveTenant() tenantId: string,
    @CurrentUser() userId: string,
  ) {
    return this.hospService.create(dto, tenantId, userId);
  }

  @Patch(':id')
  @ResponseMessage('Hospitalization updated successfully')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateHospitalizationDto,
    @ActiveTenant() tenantId: string,
  ) {
    return this.hospService.update(id, dto, tenantId);
  }

  @Patch(':id/discharge')
  @ResponseMessage('Patient discharged successfully')
  async discharge(
    @Param('id') id: string,
    @Body() dto: DischargeHospitalizationDto,
    @ActiveTenant() tenantId: string,
    @CurrentUser() userId: string,
  ) {
    return this.hospService.discharge(id, dto, tenantId, userId);
  }

  @Post(':id/notes')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Note added successfully')
  async addNote(
    @Param('id') id: string,
    @Body() dto: AddNoteDto,
    @ActiveTenant() tenantId: string,
    @CurrentUser() userId: string,
  ) {
    return this.hospService.addNote(id, dto, tenantId, userId);
  }

  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Item added successfully')
  async addItem(
    @Param('id') id: string,
    @Body() dto: AddItemDto,
    @ActiveTenant() tenantId: string,
  ) {
    return this.hospService.addItem(id, dto, tenantId);
  }

  @Post(':id/bill')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Bill generated successfully')
  async generateBill(
    @Param('id') id: string,
    @Body() dto: GenerateBillDto,
    @ActiveTenant() tenantId: string,
    @CurrentUser() userId: string,
  ) {
    return this.hospService.generateBill(id, dto, tenantId, userId);
  }
}
