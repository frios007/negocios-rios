import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { SuppliersService } from "./suppliers.service";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { ResponseMessage } from "@/core/decorators/response-message.decorator";
import { ActiveTenant } from "@/core/decorators/tenant.decorator";
import { PaginationDto } from "@/core/dto/pagination.dto";

@Controller("inventory/suppliers")
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @ResponseMessage("Supplier created successfully")
  async create(
    @Body() createSupplierDto: CreateSupplierDto,
    @ActiveTenant() tenantId: string,
  ) {
    return this.suppliersService.create(createSupplierDto, tenantId);
  }

  @Get()
  @ResponseMessage("Suppliers retrieved successfully")
  async findAll(
    @Query() pagination: PaginationDto,
    @ActiveTenant() tenantId: string,
  ) {
    return this.suppliersService.findAll(tenantId, pagination);
  }

  @Get("options")
  @ResponseMessage("Supplier options retrieved successfully")
  async findOptions(@ActiveTenant() tenantId: string) {
    return this.suppliersService.findOptions(tenantId);
  }

  @Get(":id")
  @ResponseMessage("Supplier retrieved successfully")
  async findOne(@Param("id") id: string, @ActiveTenant() tenantId: string) {
    return this.suppliersService.findOne(id, tenantId);
  }

  @Patch(":id")
  @ResponseMessage("Supplier updated successfully")
  async update(
    @Param("id") id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
    @ActiveTenant() tenantId: string,
  ) {
    return this.suppliersService.update(id, tenantId, updateSupplierDto);
  }

  @Delete(":id")
  @ResponseMessage("Supplier deleted successfully")
  async remove(@Param("id") id: string, @ActiveTenant() tenantId: string) {
    return this.suppliersService.remove(id, tenantId);
  }
}
