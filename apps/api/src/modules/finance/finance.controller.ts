import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { ActiveTenant } from '@/core/decorators/tenant.decorator';
import { CurrentUser } from '@/core/decorators/user.decorator';
import { Roles } from '@/core/decorators/roles.decorator';
import { ResponseMessage } from '@/core/decorators/response-message.decorator';
import type { JwtPayload } from '@/modules/auth/interface/request-with-user.interface';

@Controller('finance')
@Roles('ADMIN', 'OWNER')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // ─── Summary KPI ─────────────────────────────────────

  @Get('summary')
  @ResponseMessage('Finance summary retrieved successfully')
  async getSummary(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('businessUnitId') businessUnitId?: string,
    @CurrentUser('full') user?: JwtPayload,
  ) {
    const now = new Date();
    const defaultFrom =
      from || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const defaultTo = to || now.toISOString().split('T')[0];
    return this.financeService.getSummary(user!, defaultFrom, defaultTo, businessUnitId);
  }

  // ─── Monthly Trend ───────────────────────────────────

  @Get('monthly-trend')
  @ResponseMessage('Monthly trend retrieved successfully')
  async getMonthlyTrend(
    @Query('months') months?: string,
    @Query('businessUnitId') businessUnitId?: string,
    @CurrentUser('full') user?: JwtPayload,
  ) {
    return this.financeService.getMonthlyTrend(
      user!,
      months ? parseInt(months, 10) : 6,
      businessUnitId,
    );
  }

  // ─── Expense Categories ──────────────────────────────

  @Get('expense-categories')
  @ResponseMessage('Expense categories retrieved successfully')
  async getExpenseCategories(
    @Query('businessUnitId') businessUnitId?: string,
    @CurrentUser('full') user?: JwtPayload,
  ) {
    return this.financeService.getExpenseCategories(user!, businessUnitId);
  }

  @Post('expense-categories')
  @ResponseMessage('Expense category created successfully')
  async createExpenseCategory(
    @Body() dto: CreateExpenseCategoryDto,
    @ActiveTenant() tenantId: string,
  ) {
    return this.financeService.createExpenseCategory(dto, tenantId);
  }

  @Delete('expense-categories/:id')
  @ResponseMessage('Expense category deleted successfully')
  async deleteExpenseCategory(
    @Param('id') id: string,
    @ActiveTenant() tenantId: string,
  ) {
    return this.financeService.deleteExpenseCategory(id, tenantId);
  }

  // ─── Expenses CRUD ───────────────────────────────────

  @Get('expenses')
  @ResponseMessage('Expenses retrieved successfully')
  async getExpenses(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('businessUnitId') businessUnitId?: string,
    @CurrentUser('full') user?: JwtPayload,
  ) {
    return this.financeService.getExpenses(
      user!,
      { page: page ? parseInt(page, 10) : 1, limit: limit ? parseInt(limit, 10) : 200 } as any,
      businessUnitId,
    );
  }

  @Post('expenses')
  @ResponseMessage('Expense created successfully')
  async createExpense(
    @Body() dto: CreateExpenseDto,
    @ActiveTenant() tenantId: string,
    @CurrentUser() userId: string,
  ) {
    return this.financeService.createExpense(dto, tenantId, userId);
  }

  @Patch('expenses/:id')
  @ResponseMessage('Expense updated successfully')
  async updateExpense(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
    @Query('businessUnitId') businessUnitId?: string,
    @CurrentUser('full') user?: JwtPayload,
  ) {
    return this.financeService.updateExpense(id, dto, user!, businessUnitId);
  }

  @Delete('expenses/:id')
  @ResponseMessage('Expense deleted successfully')
  async deleteExpense(
    @Param('id') id: string,
    @Query('businessUnitId') businessUnitId?: string,
    @CurrentUser('full') user?: JwtPayload,
  ) {
    return this.financeService.deleteExpense(id, user!, businessUnitId);
  }
}
