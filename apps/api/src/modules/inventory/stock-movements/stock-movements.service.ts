import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { ProductsService } from '../products/products.service';
import { StockMovementsRepository } from './stock-movements.repository';
import { PaginationDto } from '@/core/dto/pagination.dto';
import type { MovementType } from '@/core/database/schemas/inventory/inventory.tables';

const OUTGOING_TYPES: MovementType[] = ['SALE_OUT', 'ADJUSTMENT_OUT'];

@Injectable()
export class StockMovementsService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly stockMovementsRepository: StockMovementsRepository,
  ) {}

  async create(
    createStockMovementDto: CreateStockMovementDto,
    tenantId: string,
    userId: string,
  ) {
    const product = await this.productsService.findOne(
      createStockMovementDto.productId,
      tenantId,
    );

    const isOutgoing = OUTGOING_TYPES.includes(createStockMovementDto.type);
    const signedQuantity = isOutgoing
      ? -Math.abs(createStockMovementDto.quantity)
      : Math.abs(createStockMovementDto.quantity);

    if (isOutgoing && product.stockQuantity + signedQuantity < 0) {
      throw new BadRequestException(
        `Insufficient stock. Current stock is ${product.stockQuantity}.`,
      );
    }

    return this.stockMovementsRepository.recordMovementAndUpdateStock({
      ...createStockMovementDto,
      quantity: signedQuantity,
      userId,
      businessUnitId: tenantId,
      expirationDate: createStockMovementDto.expirationDate
        ? new Date(createStockMovementDto.expirationDate)
        : null,
    });
  }

  async findAll(tenantId: string, pagination: PaginationDto) {
    return this.stockMovementsRepository.findAll(tenantId, pagination);
  }
}

