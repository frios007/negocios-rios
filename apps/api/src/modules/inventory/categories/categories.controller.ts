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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ResponseMessage } from '@/core/decorators/response-message.decorator';
import { ActiveTenant } from '@/core/decorators/tenant.decorator';
import { PaginationDto } from '@/core/dto/pagination.dto';

@Controller('inventory/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ResponseMessage('Category created successfully')
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @ActiveTenant() tenantId: string,
  ) {
    return this.categoriesService.create(createCategoryDto, tenantId);
  }

  @Get()
  @ResponseMessage('Categories retrieved successfully')
  async findAll(
    @Query() pagination: PaginationDto,
    @ActiveTenant() tenantId: string,
  ) {
    return this.categoriesService.findAll(tenantId, pagination);
  }

  @Get('options')
  @ResponseMessage('Category options retrieved successfully')
  async findOptions(@ActiveTenant() tenantId: string) {
    return this.categoriesService.findOptions(tenantId);
  }

  @Get(':id')
  @ResponseMessage('Category retrieved successfully')
  async findOne(@Param('id') id: string, @ActiveTenant() tenantId: string) {
    return this.categoriesService.findOne(id, tenantId);
  }

  @Patch(':id')
  @ResponseMessage('Category updated successfully')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @ActiveTenant() tenantId: string,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, tenantId);
  }

  @Delete(':id')
  @ResponseMessage('Category deleted successfully')
  async remove(@Param('id') id: string, @ActiveTenant() tenantId: string) {
    return this.categoriesService.remove(id, tenantId);
  }
}
