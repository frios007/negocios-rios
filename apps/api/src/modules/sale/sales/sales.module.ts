import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { SalesRepository } from './sales.repository';
import { ProductsModule } from '@/modules/inventory/products/products.module';
import { ClientsModule } from '../clients/clients.module';
import { StockMovementsModule } from '@/modules/inventory/stock-movements/stock-movements.module';

@Module({
  imports: [
    ProductsModule,
    ClientsModule,
    StockMovementsModule,
  ],
  controllers: [SalesController],
  providers: [SalesService, SalesRepository],
  exports: [SalesRepository],
})
export class SalesModule {}
