import { Module, RequestMethod } from "@nestjs/common";
import { DatabaseModule } from "./core/database/database.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { AuthGuard } from "./modules/auth/guards/auth.guard";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { TenantGuard } from "./core/guards/tenant.guard";
import { RolesGuard } from "./core/guards/roles.guard";
import { CategoriesModule } from "./modules/inventory/categories/categories.module";
import { SuppliersModule } from "./modules/inventory/suppliers/suppliers.module";
import { ProductsModule } from "./modules/inventory/products/products.module";
import { StockMovementsModule } from "./modules/inventory/stock-movements/stock-movements.module";
import { ClientsModule } from "./modules/sale/clients/clients.module";
import { SalesModule } from "./modules/sale/sales/sales.module";
import { FinanceModule } from "./modules/finance/finance.module";
import { PatientsModule } from "./modules/clinical/patients/patients.module";
import { RecordsModule } from "./modules/clinical/records/records.module";
import { HospitalizationsModule } from "./modules/clinical/hospitalizations/hospitalizations.module";
import { HttpLoggerMiddleware } from "./core/middleware/http-logger.middleware";
import { MiddlewareConsumer } from "@nestjs/common";

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    SuppliersModule,
    ProductsModule,
    StockMovementsModule,
    ClientsModule,
    SalesModule,
    FinanceModule,
    PatientsModule,
    RecordsModule,
    HospitalizationsModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: TenantGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggerMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
