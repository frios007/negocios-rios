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
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { ActiveTenant } from '@/core/decorators/tenant.decorator';
import { CurrentUser } from '@/core/decorators/user.decorator';
import { ResponseMessage } from '@/core/decorators/response-message.decorator';

@Controller('clinical/records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get()
  @ResponseMessage('Clinical records retrieved successfully')
  async findAll(
    @ActiveTenant() tenantId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '200',
  ) {
    return this.recordsService.findAll(tenantId, {
      page: +page,
      limit: +limit,
    });
  }

  @Get(':id')
  @ResponseMessage('Clinical record retrieved successfully')
  async findById(
    @Param('id') id: string,
    @ActiveTenant() tenantId: string,
  ) {
    return this.recordsService.findById(id, tenantId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Clinical record created successfully')
  async create(
    @Body() dto: CreateRecordDto,
    @ActiveTenant() tenantId: string,
    @CurrentUser() userId: string,
  ) {
    return this.recordsService.create(dto, tenantId, userId);
  }

  @Patch(':id')
  @ResponseMessage('Clinical record updated successfully')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRecordDto,
    @ActiveTenant() tenantId: string,
  ) {
    return this.recordsService.update(id, dto, tenantId);
  }
}
