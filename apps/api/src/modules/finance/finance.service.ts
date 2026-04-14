import { Injectable, NotFoundException } from '@nestjs/common';
import { FinanceRepository } from './finance.repository';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { PaginationDto } from '@/core/dto/pagination.dto';
import { JwtPayload } from '@/modules/auth/interface/request-with-user.interface';

@Injectable()
export class FinanceService {
  constructor(private readonly repo: FinanceRepository) {}

  /**
   * Resolves which business unit IDs to query.
   * - If a specific businessUnitId is provided, use only that one.
   * - Otherwise, aggregate across all BUs the user has access to.
   */
  private resolveTenantIds(user: JwtPayload, businessUnitId?: string): string[] {
    if (businessUnitId) return [businessUnitId];
    return user.businessUnits.map((bu) => bu.businessUnitId);
  }

  // ─── Summary ─────────────────────────────────────────

  async getSummary(
    user: JwtPayload,
    from: string,
    to: string,
    businessUnitId?: string,
  ) {
    const tenantIds = this.resolveTenantIds(user, businessUnitId);

    const [income, expense, pendingCredit] = await Promise.all([
      this.repo.getIncomeSummary(tenantIds, from, to),
      this.repo.getExpenseSummary(tenantIds, from, to),
      this.repo.getPendingCredit(tenantIds),
    ]);

    return {
      income: income.totalIncome,
      expenses: expense.totalExpenses,
      netProfit: income.totalIncome - expense.totalExpenses,
      pendingCredit,
      salesCount: income.salesCount,
      expensesCount: expense.expensesCount,
      period: { from, to },
    };
  }

  // ─── Monthly Trend ───────────────────────────────────

  async getMonthlyTrend(
    user: JwtPayload,
    months: number = 6,
    businessUnitId?: string,
  ) {
    const tenantIds = this.resolveTenantIds(user, businessUnitId);
    return this.repo.getMonthlyTrend(tenantIds, months);
  }

  // ─── Expense Categories ──────────────────────────────

  async getExpenseCategories(user: JwtPayload, businessUnitId?: string) {
    const tenantIds = this.resolveTenantIds(user, businessUnitId);
    if (tenantIds.length === 1) {
      return this.repo.findAllCategories(tenantIds[0]);
    }
    return this.repo.findAllCategoriesMulti(tenantIds);
  }

  async createExpenseCategory(
    dto: CreateExpenseCategoryDto,
    tenantId: string,
  ) {
    return this.repo.createCategory({
      name: dto.name,
      businessUnitId: tenantId,
    });
  }

  async deleteExpenseCategory(id: string, tenantId: string) {
    const result = await this.repo.deleteCategory(id, tenantId);
    if (!result) throw new NotFoundException('Categoría no encontrada');
    return result;
  }

  // ─── Expenses CRUD ───────────────────────────────────

  async getExpenses(
    user: JwtPayload,
    pagination: PaginationDto,
    businessUnitId?: string,
  ) {
    const tenantIds = this.resolveTenantIds(user, businessUnitId);
    return this.repo.findAllExpenses(tenantIds, pagination);
  }

  async createExpense(
    dto: CreateExpenseDto,
    tenantId: string,
    userId: string,
  ) {
    return this.repo.createExpense({
      description: dto.description,
      amount: dto.amount.toString(),
      categoryId: dto.categoryId || null,
      userId,
      businessUnitId: tenantId,
      expenseDate: dto.expenseDate || new Date().toISOString().split('T')[0],
      paymentMethod: dto.paymentMethod,
      referenceNumber: dto.referenceNumber || null,
      notes: dto.notes || null,
    });
  }

  async updateExpense(
    id: string,
    dto: UpdateExpenseDto,
    user: JwtPayload,
    businessUnitId?: string,
  ) {
    const tenantIds = this.resolveTenantIds(user, businessUnitId);
    const updateData: any = {};
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.amount !== undefined) updateData.amount = dto.amount.toString();
    if (dto.categoryId !== undefined) updateData.categoryId = dto.categoryId;
    if (dto.expenseDate !== undefined) updateData.expenseDate = dto.expenseDate;
    if (dto.paymentMethod !== undefined) updateData.paymentMethod = dto.paymentMethod;
    if (dto.referenceNumber !== undefined) updateData.referenceNumber = dto.referenceNumber;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const result = await this.repo.updateExpense(id, tenantIds, updateData);
    if (!result) throw new NotFoundException('Gasto no encontrado');
    return result;
  }

  async deleteExpense(
    id: string,
    user: JwtPayload,
    businessUnitId?: string,
  ) {
    const tenantIds = this.resolveTenantIds(user, businessUnitId);
    const result = await this.repo.deleteExpense(id, tenantIds);
    if (!result) throw new NotFoundException('Gasto no encontrado');
    return result;
  }
}
