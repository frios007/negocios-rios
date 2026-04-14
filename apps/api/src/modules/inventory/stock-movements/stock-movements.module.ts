import { Module } from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { StockMovementsController } from './stock-movements.controller';
import { StockMovementsRepository } from './stock-movements.repository';
import { ProductsModule } from '../products/products.module';

@Module({
  controllers: [StockMovementsController],
  providers: [StockMovementsService, StockMovementsRepository],
  exports: [StockMovementsRepository],
  imports: [ProductsModule],
})
export class StockMovementsModule {}
