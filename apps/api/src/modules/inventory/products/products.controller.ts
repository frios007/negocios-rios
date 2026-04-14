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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ActiveTenant } from '@/core/decorators/tenant.decorator';
import { ResponseMessage } from '@/core/decorators/response-message.decorator';
import { PaginationDto } from '@/core/dto/pagination.dto';

@Controller('inventory/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ResponseMessage('Product created successfully')
  async create(
    @Body() createProductDto: CreateProductDto,
    @ActiveTenant() tenantId: string,
  ) {
    return this.productsService.create(tenantId, createProductDto);
  }

  @Get()
  @ResponseMessage('Products retrieved successfully')
  async findAllActive(
    @ActiveTenant() tenantId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.productsService.findAllActive(tenantId, pagination);
  }

  @Get('options')
  @ResponseMessage('Product options retrieved successfully')
  async findOptions(@ActiveTenant() tenantId: string) {
    return this.productsService.findOptions(tenantId);
  }

  @Get(':id')
  @ResponseMessage('Product retrieved successfully')
  async findOne(@Param('id') id: string, @ActiveTenant() tenantId: string) {
    return this.productsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @ResponseMessage('Product updated successfully')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @ActiveTenant() tenantId: string,
  ) {
    return this.productsService.update(id, tenantId, updateProductDto);
  }

  @Delete(':id')
  @ResponseMessage('Product deleted successfully')
  async remove(@Param('id') id: string, @ActiveTenant() tenantId: string) {
    return this.productsService.remove(id, tenantId);
  }
}
