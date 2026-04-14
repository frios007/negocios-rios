import { Controller, Post, Body, Get, Query, Param } from "@nestjs/common";
import { SalesService } from "./sales.service";
import { CreateSaleDto } from "./dto/create-sale.dto";
import { GetSalesDto } from "./dto/get-sales.dto";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { ActiveTenant } from "@/core/decorators/tenant.decorator";
import { CurrentUser } from "@/core/decorators/user.decorator";
import { ResponseMessage } from "@/core/decorators/response-message.decorator";

@Controller("sales")
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ResponseMessage("Sale completed successfully")
  async createSale(
    @Body() dto: CreateSaleDto,
    @ActiveTenant() tenantId: string,
    @CurrentUser() userId: string,
  ) {
    return this.salesService.createSale(dto, tenantId, userId);
  }

  @Get()
  @ResponseMessage("Sales retrieved successfully")
  async getSales(
    @Query() dto: GetSalesDto,
    @ActiveTenant() tenantId: string,
  ) {
    return this.salesService.findAllSales(dto, tenantId);
  }

  @Get("reports/daily-summary")
  @ResponseMessage("Daily sales summary retrieved successfully")
  async getDailySummary(
    @Query("date") date: string,
    @ActiveTenant() tenantId: string,
  ) {
    return this.salesService.getDailySummary(date, tenantId);
  }

  @Get(":id")
  @ResponseMessage("Sale details retrieved successfully")
  async getSaleDetails(
    @Param("id") id: string,
    @ActiveTenant() tenantId: string,
  ) {
    return this.salesService.findSaleById(id, tenantId);
  }

  @Post(":id/void")
  @ResponseMessage("Sale successfully voided")
  // @Roles('ADMIN', 'OWNER') // Uncomment when RoleGuard exists
  async voidSale(
    @Param("id") id: string,
    @ActiveTenant() tenantId: string,
    @CurrentUser() userId: string,
  ) {
    return this.salesService.voidSale(id, tenantId, userId);
  }

  @Post(":id/payments")
  @ResponseMessage("Payment registered successfully")
  async addPayment(
    @Param("id") id: string,
    @Body() dto: CreatePaymentDto,
    @ActiveTenant() tenantId: string,
    @CurrentUser() userId: string,
  ) {
    return this.salesService.addPayment(id, dto, tenantId, userId);
  }
}
