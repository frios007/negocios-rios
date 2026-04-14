import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsRepository } from './products.repository';
import { PaginationDto } from '@/core/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  private computeUnitPrice(costPrice: number, profitMargin: number): string {
    return (costPrice * (1 + profitMargin / 100)).toFixed(2);
  }

  async create(tenantId: string, createProductDto: CreateProductDto) {
    const unitPrice = this.computeUnitPrice(
      createProductDto.costPrice,
      createProductDto.profitMargin,
    );
    return this.productsRepository.create({
      ...createProductDto,
      costPrice: createProductDto.costPrice.toFixed(2),
      profitMargin: createProductDto.profitMargin.toFixed(2),
      unitPrice,
      businessUnitId: tenantId,
    });
  }

  async findAllActive(tenantId: string, pagination: PaginationDto) {
    return this.productsRepository.findAllActive(tenantId, pagination);
  }

  async findOne(id: string, tenantId: string) {
    const product = await this.productsRepository.findById(id, tenantId);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findOptions(tenantId: string) {
    return this.productsRepository.findOptions(tenantId);
  }

  async update(
    id: string,
    tenantId: string,
    updateProductDto: UpdateProductDto,
  ) {
    const existing = await this.findOne(id, tenantId);

    const costPrice = updateProductDto.costPrice ?? Number(existing.costPrice);
    const profitMargin =
      updateProductDto.profitMargin ?? Number(existing.profitMargin);

    const data: Record<string, unknown> = { ...updateProductDto };

    // Always recompute unitPrice when cost or margin changes
    if (
      updateProductDto.costPrice !== undefined ||
      updateProductDto.profitMargin !== undefined
    ) {
      data.costPrice = costPrice.toFixed(2);
      data.profitMargin = profitMargin.toFixed(2);
      data.unitPrice = this.computeUnitPrice(costPrice, profitMargin);
    }

    return await this.productsRepository.update(id, tenantId, data);
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.productsRepository.softDelete(id, tenantId);
  }
}
