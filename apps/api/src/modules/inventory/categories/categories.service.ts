import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesRepository } from './categories.repository';
import { PaginationDto } from '@/core/dto/pagination.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(createCategoryDto: CreateCategoryDto, tenantId: string) {
    return this.categoriesRepository.create({
      ...createCategoryDto,
      businessUnitId: tenantId,
    });
  }

  async findAll(tenantId: string, pagination: PaginationDto) {
    return this.categoriesRepository.findAll(tenantId, pagination);
  }

  async findOne(id: string, tenantId: string) {
    const category = await this.categoriesRepository.findById(id, tenantId);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async findOptions(tenantId: string) {
    return this.categoriesRepository.findOptions(tenantId);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    tenantId: string,
  ) {
    await this.findOne(id, tenantId);
    return this.categoriesRepository.update(id, tenantId, updateCategoryDto);
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.categoriesRepository.remove(id, tenantId);
  }
}
