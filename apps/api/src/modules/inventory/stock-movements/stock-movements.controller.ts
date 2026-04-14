import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { ResponseMessage } from '@/core/decorators/response-message.decorator';
import { ActiveTenant } from '@/core/decorators/tenant.decorator';
import { PaginationDto } from '@/core/dto/pagination.dto';
import { type AuthenticatedRequest } from '@/modules/auth/interface/request-with-user.interface';

@Controller('inventory/stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post()
  @ResponseMessage('Stock movement recorded successfully')
  async create(
    @Body() createStockMovementDto: CreateStockMovementDto,
    @ActiveTenant() tenantId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.stockMovementsService.create(
      createStockMovementDto,
      tenantId,
      request.user.sub,
    );
  }

  @Get()
  @ResponseMessage('Stock history retrieved successfully')
  async findAll(
    @ActiveTenant() tenantId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.stockMovementsService.findAll(tenantId, pagination);
  }
}
