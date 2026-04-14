import { Module } from '@nestjs/common';
import { HospitalizationsController } from './hospitalizations.controller';
import { HospitalizationsService } from './hospitalizations.service';
import { HospitalizationsRepository } from './hospitalizations.repository';
import { SalesModule } from '@/modules/sale/sales/sales.module';

@Module({
  imports: [SalesModule],
  controllers: [HospitalizationsController],
  providers: [HospitalizationsService, HospitalizationsRepository],
  exports: [HospitalizationsRepository],
})
export class HospitalizationsModule {}
