import { Injectable } from '@nestjs/common';
import { Database, DbTransaction } from '@/core/database/database.provider';
import {
  expenses,
  expenseCategories,
  sales,
} from '@/core/database/schemas/sales/sales.tables';
import { client } from '@/core/database/schemas/sales/sales.tables';
import { users } from '@/core/database/schemas/core/core.tables';
import { eq, and, count, sql, gte, lte, inArray, desc } from 'drizzle-orm';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '@/core/common/utils/pagination.utils';
import { PaginationDto } from '@/core/dto/pagination.dto';

@Injectable()
export class FinanceRepository extends Database {
  // ─── Expense Categories ──────────────────────────────

  async createCategory(
    data: typeof expenseCategories.$inferInsert,
    tx?: DbTransaction,
  ) {
    const [row] = await this.getClient(tx)
      .insert(expenseCategories)
      .values(data)
      .returning();
    return row;
  }

  async findAllCategories(tenantId: string, tx?: DbTransaction) {
    return this.getClient(tx).query.expenseCategories.findMany({
      where: eq(expenseCategories.businessUnitId, tenantId),
      orderBy: (c, { asc }) => [asc(c.name)],
    });
  }

  async findAllCategoriesMulti(tenantIds: string[], tx?: DbTransaction) {
    return this.getClient(tx).query.expenseCategories.findMany({
      where: inArray(expenseCategories.businessUnitId, tenantIds),
      orderBy: (c, { asc }) => [asc(c.name)],
    });
  }

  async deleteCategory(id: string, tenantId: string, tx?: DbTransaction) {
    const [row] = await this.getClient(tx)
      .delete(expenseCategories)
      .where(
        this.withTenant(expenseCategories, tenantId, eq(expenseCategories.id, id)),
      )
      .returning();
    return row;
  }

  // ─── Expenses CRUD ───────────────────────────────────

  async createExpense(
    data: typeof expenses.$inferInsert,
    tx?: DbTransaction,
  ) {
    const [row] = await this.getClient(tx)
      .insert(expenses)
      .values(data)
      .returning();
    return row;
  }

  async findAllExpenses(
    tenantIds: string[],
    pagination: PaginationDto,
    tx?: DbTransaction,
  ) {
    const { page, limit, offset } = getPaginationParams(pagination);
    const db = this.getClient(tx);

    const whereCondition =
      tenantIds.length === 1
        ? eq(expenses.businessUnitId, tenantIds[0])
        : inArray(expenses.businessUnitId, tenantIds);

    const [data, totalResult] = await Promise.all([
      db
        .select({
          expense: expenses,
          category: expenseCategories,
          user: { firstName: users.firstName, lastName: users.lastName },
        })
        .from(expenses)
        .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
        .leftJoin(users, eq(expenses.userId, users.id))
        .where(whereCondition)
        .orderBy(desc(expenses.expenseDate))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(expenses).where(whereCondition),
    ]);

    const items = data.map((row) => ({
      ...row.expense,
      category: row.category,
      user: row.user,
    }));

    return buildPaginatedResponse(items, totalResult[0].value, page, limit);
  }

  async updateExpense(
    id: string,
    tenantIds: string[],
    data: Partial<typeof expenses.$inferInsert>,
    tx?: DbTransaction,
  ) {
    const whereCondition =
      tenantIds.length === 1
        ? this.withTenant(expenses, tenantIds[0], eq(expenses.id, id))
        : and(inArray(expenses.businessUnitId, tenantIds), eq(expenses.id, id));

    const [row] = await this.getClient(tx)
      .update(expenses)
      .set({ ...data, updatedAt: new Date() })
      .where(whereCondition!)
      .returning();
    return row;
  }

  async deleteExpense(id: string, tenantIds: string[], tx?: DbTransaction) {
    const whereCondition =
      tenantIds.length === 1
        ? this.withTenant(expenses, tenantIds[0], eq(expenses.id, id))
        : and(inArray(expenses.businessUnitId, tenantIds), eq(expenses.id, id));

    const [row] = await this.getClient(tx)
      .delete(expenses)
      .where(whereCondition!)
      .returning();
    return row;
  }

  // ─── Finance Aggregation Queries ─────────────────────

  async getIncomeSummary(
    tenantIds: string[],
    from: string,
    to: string,
    tx?: DbTransaction,
  ) {
    const db = this.getClient(tx);
    const buFilter =
      tenantIds.length === 1
        ? eq(sales.businessUnitId, tenantIds[0])
        : inArray(sales.businessUnitId, tenantIds);

    const result = await db
      .select({
        totalIncome: sql<string>`COALESCE(SUM(${sales.totalAmount}), 0)`,
        salesCount: count(),
      })
      .from(sales)
      .where(
        and(
          buFilter,
          eq(sales.status, 'COMPLETED'),
          sql`${sales.createdAt}::date >= ${from}::date`,
          sql`${sales.createdAt}::date <= ${to}::date`,
        ),
      );

    return {
      totalIncome: Number(result[0].totalIncome),
      salesCount: result[0].salesCount,
    };
  }

  async getExpenseSummary(
    tenantIds: string[],
    from: string,
    to: string,
    tx?: DbTransaction,
  ) {
    const db = this.getClient(tx);
    const buFilter =
      tenantIds.length === 1
        ? eq(expenses.businessUnitId, tenantIds[0])
        : inArray(expenses.businessUnitId, tenantIds);

    const result = await db
      .select({
        totalExpenses: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
        expensesCount: count(),
      })
      .from(expenses)
      .where(
        and(
          buFilter,
          gte(expenses.expenseDate, from),
          lte(expenses.expenseDate, to),
        ),
      );

    return {
      totalExpenses: Number(result[0].totalExpenses),
      expensesCount: result[0].expensesCount,
    };
  }

  async getPendingCredit(tenantIds: string[], tx?: DbTransaction) {
    const db = this.getClient(tx);
    const buFilter =
      tenantIds.length === 1
        ? eq(client.businessUnitId, tenantIds[0])
        : inArray(client.businessUnitId, tenantIds);

    const result = await db
      .select({
        totalPending: sql<string>`COALESCE(SUM(${client.balanceDue}), 0)`,
      })
      .from(client)
      .where(and(buFilter, eq(client.isActive, true)));

    return Number(result[0].totalPending);
  }

  async getMonthlyTrend(
    tenantIds: string[],
    monthsBack: number,
    tx?: DbTransaction,
  ) {
    const db = this.getClient(tx);
    const buFilterSales =
      tenantIds.length === 1
        ? eq(sales.businessUnitId, tenantIds[0])
        : inArray(sales.businessUnitId, tenantIds);
    const buFilterExpenses =
      tenantIds.length === 1
        ? eq(expenses.businessUnitId, tenantIds[0])
        : inArray(expenses.businessUnitId, tenantIds);

    const sinceDate = new Date();
    sinceDate.setMonth(sinceDate.getMonth() - monthsBack);
    sinceDate.setDate(1);
    const sinceDateStr = `${sinceDate.getFullYear()}-${String(sinceDate.getMonth() + 1).padStart(2, '0')}-01`;

    const [incomeByMonth, expensesByMonth] = await Promise.all([
      db
        .select({
          month: sql<string>`TO_CHAR(${sales.createdAt}, 'YYYY-MM')`,
          total: sql<string>`COALESCE(SUM(${sales.totalAmount}), 0)`,
        })
        .from(sales)
        .where(
          and(
            buFilterSales,
            eq(sales.status, 'COMPLETED'),
            sql`${sales.createdAt}::date >= ${sinceDateStr}::date`,
          ),
        )
        .groupBy(sql`TO_CHAR(${sales.createdAt}, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(${sales.createdAt}, 'YYYY-MM')`),
      db
        .select({
          month: sql<string>`TO_CHAR(${expenses.expenseDate}::timestamp, 'YYYY-MM')`,
          total: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
        })
        .from(expenses)
        .where(
          and(
            buFilterExpenses,
            gte(expenses.expenseDate, sinceDateStr),
          ),
        )
        .groupBy(sql`TO_CHAR(${expenses.expenseDate}::timestamp, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(${expenses.expenseDate}::timestamp, 'YYYY-MM')`),
    ]);

    // Merge into a single array
    const monthSet = new Set<string>();
    incomeByMonth.forEach((r) => monthSet.add(r.month));
    expensesByMonth.forEach((r) => monthSet.add(r.month));

    const incomeMap = new Map(incomeByMonth.map((r) => [r.month, Number(r.total)]));
    const expenseMap = new Map(expensesByMonth.map((r) => [r.month, Number(r.total)]));

    return Array.from(monthSet)
      .sort()
      .map((month) => ({
        month,
        income: incomeMap.get(month) ?? 0,
        expenses: expenseMap.get(month) ?? 0,
      }));
  }
}
