import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/core/database/database-connection';
import { type DbClient } from '@/core/database/database.provider';
import { Decimal } from 'decimal.js';


import { SalesRepository } from './sales.repository';
import { CreateSaleDto } from './dto/create-sale.dto';
import { GetSalesDto } from './dto/get-sales.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProductsRepository } from '@/modules/inventory/products/products.repository';
import { ClientsRepository } from '../clients/clients.repository';
import { StockMovementsRepository } from '@/modules/inventory/stock-movements/stock-movements.repository';

@Injectable()
export class SalesService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: DbClient,
    private readonly salesRepo: SalesRepository,
    private readonly productsRepo: ProductsRepository,
    private readonly clientsRepo: ClientsRepository,
    private readonly stockMovementsRepo: StockMovementsRepository,
  ) {}

  async createSale(dto: CreateSaleDto, tenantId: string, userId: string) {
    return await this.db.transaction(async (tx) => {
      // Credit sales require a client WITH a credit limit established
      if (dto.paymentMethod === 'CREDIT') {
        if (!dto.clientId) {
          throw new BadRequestException(
            'Las ventas a crédito requieren un cliente registrado con límite de crédito.',
          );
        }

        const creditClient = await this.clientsRepo.findById(dto.clientId, tenantId, tx);
        if (!creditClient) {
          throw new BadRequestException('Cliente no encontrado.');
        }

        const creditLimit = new Decimal(creditClient.creditLimit);
        if (creditLimit.isZero()) {
          throw new BadRequestException(
            'Este cliente no tiene un límite de crédito establecido. ' +
            'Asigne un límite de crédito desde el módulo de clientes antes de realizar ventas a crédito.',
          );
        }
      }

      let client: Awaited<ReturnType<typeof this.clientsRepo.findById>> | undefined = undefined;
      if (dto.clientId) {
        client = await this.clientsRepo.findById(dto.clientId, tenantId, tx);
        if (!client) {
          throw new BadRequestException('Client not found');
        }
      }

      let totalAmount = new Decimal(0);
      const detailsMap: {
        productId: string;
        quantity: number;
        unitPrice: string;
        subtotal: number;
      }[] = [];

      for (const item of dto.details) {
        const product = await this.productsRepo.findById(item.productId, tenantId, tx);
        if (!product) {
          throw new BadRequestException(`Product ${item.productId} not found`);
        }

        const unitPriceNum = new Decimal(product.unitPrice);
        const lineTotal = unitPriceNum.mul(item.quantity);
        totalAmount = totalAmount.add(lineTotal);

        detailsMap.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.unitPrice,
          subtotal: lineTotal.toNumber(),
        });

        // Only validate/decrement stock for GOODS (not services)
        if (product.productType === 'GOODS') {
          if (product.stockQuantity < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for product: ${product.name}. Only ${product.stockQuantity} left.`,
            );
          }

          const updatedProduct = await this.productsRepo.decrementStock(product.id, item.quantity, tenantId, tx);
          if (!updatedProduct) {
            throw new BadRequestException(`Concurrency conflict. Insufficient stock for product: ${product.name} during checkout.`);
          }

          await this.stockMovementsRepo.create({
            productId: product.id,
            userId: userId,
            type: 'SALE_OUT',
            quantity: -item.quantity,
            notes: 'POS Sale',
            businessUnitId: tenantId,
          }, tx);
        }
      }

      let paymentStatus: 'PAID' | 'PARTIAL' | 'PENDING' = 'PAID';
      let balanceIncrease = new Decimal(0);
      const amountPaid = new Decimal(dto.amountPaid);

      if (dto.paymentMethod === 'CREDIT') {
        if (amountPaid.isZero()) paymentStatus = 'PENDING';
        else if (amountPaid.lessThan(totalAmount)) paymentStatus = 'PARTIAL';
        else paymentStatus = 'PAID';

        balanceIncrease = totalAmount.sub(amountPaid);

        const currentBalance = new Decimal(client!.balanceDue);
        const creditLimit = new Decimal(client!.creditLimit);

        if (currentBalance.add(balanceIncrease).greaterThan(creditLimit)) {
          throw new BadRequestException(
            `Credit limit exceeded. Client has a limit of $${client!.creditLimit} and currently owes $${client!.balanceDue}.`,
          );
        }

        // 3. Increment Client Balance Due
        if (balanceIncrease.greaterThan(0)) {
          await this.clientsRepo.incrementBalanceDue(client!.id, balanceIncrease.toNumber(), tenantId, tx);
        }
      } else {
        if (amountPaid.lessThan(totalAmount)) {
          throw new BadRequestException(
            `Amount paid ($${amountPaid.toString()}) is less than total sale amount ($${totalAmount.toString()}).`,
          );
        }
      }

      // 4. Create Sale Record
      const newSale = await this.salesRepo.createSale({
        clientId: dto.clientId || null,
        userId: userId,
        totalAmount: totalAmount.toString(),
        subTotal: totalAmount.toString(),
        paymentMethod: dto.paymentMethod,
        paymentStatus: paymentStatus,
        businessUnitId: tenantId,
      }, tx);

      // 5. Create Sale Details Records
      const salesDetailsToInsert = detailsMap.map(detail => ({
        saleId: newSale.id,
        productId: detail.productId,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice.toString(),
        businessUnitId: tenantId,
      }));
      await this.salesRepo.createSaleDetails(salesDetailsToInsert, tx);

      // 6. Create Payment Record (if amount > 0)
      if (amountPaid.greaterThan(0)) {
        await this.salesRepo.createPayment({
          saleId: newSale.id,
          clientId: dto.clientId || null,
          userId: userId,
          amount: amountPaid.toString(),
          paymentMethod: dto.paymentMethod === 'CREDIT' ? 'CASH' : dto.paymentMethod,
          businessUnitId: tenantId,
        }, tx);
      }

      return newSale;
    });
  }

  async findAllSales(dto: GetSalesDto, tenantId: string) {
    return this.salesRepo.findAllSales(tenantId, dto);
  }

  async findSaleById(id: string, tenantId: string) {
    const sale = await this.salesRepo.findByIdWithDetails(id, tenantId);
    if (!sale) {
      throw new BadRequestException('Sale not found');
    }
    return sale;
  }

  async voidSale(id: string, tenantId: string, userId: string) {
    return await this.db.transaction(async (tx) => {
      const sale = await this.salesRepo.findByIdWithDetails(id, tenantId, tx);
      if (!sale) throw new BadRequestException('Sale not found');
      if (sale.status === 'VOIDED') throw new BadRequestException('Sale is already voided');

      // 1. Mark status as VOIDED
      await this.salesRepo.updateSaleStatus(id, 'VOIDED', tenantId, tx);

      // 2. Reverse Stock (only for GOODS items)
      if (sale.details && sale.details.length > 0) {
        for (const item of sale.details) {
          // Skip stock reversal for services
          const product = await this.productsRepo.findById(item.productId, tenantId, tx);
          if (product && product.productType === 'GOODS') {
            await this.productsRepo.incrementStock(item.productId, item.quantity, tenantId, tx);
            
            await this.stockMovementsRepo.create({
              productId: item.productId,
              userId: userId,
              type: 'ADJUSTMENT_IN',
              quantity: item.quantity,
              notes: `Voided Sale #${id}`,
              businessUnitId: tenantId,
            }, tx);
          }
        }
      }

      // 3. Reverse Debt (If credit sale and has debt)
      if (sale.paymentMethod === 'CREDIT') {
        const totalAmount = new Decimal(sale.totalAmount);

        // Sum existing payments to find actual unpaid amount
        const paidAmount = sale.payments.reduce((acc, p) => acc.add(new Decimal(p.amount)), new Decimal(0));
        
        const unpaidAmount = totalAmount.sub(paidAmount);

        if (unpaidAmount.greaterThan(0) && sale.clientId) {
          await this.clientsRepo.decrementBalanceDue(sale.clientId, unpaidAmount.toNumber(), tenantId, tx);
        }
      }

      return { message: 'Sale successfully voided' };
    });
  }

  async addPayment(saleId: string, dto: CreatePaymentDto, tenantId: string, userId: string) {
    return await this.db.transaction(async (tx) => {
      const sale = await this.salesRepo.findByIdWithDetails(saleId, tenantId, tx);
      if (!sale) throw new BadRequestException('Sale not found');
      if (sale.status === 'VOIDED') throw new BadRequestException('Cannot add payment to a voided sale');
      if (sale.paymentStatus === 'PAID') throw new BadRequestException('Sale is already fully paid');

      const paymentAmount = new Decimal(dto.amount);
      const saleTotal = new Decimal(sale.totalAmount);
      
      const priorPaidAmount = sale.payments.reduce((acc, p) => acc.add(new Decimal(p.amount)), new Decimal(0));
      const newPaidAmount = priorPaidAmount.add(paymentAmount);

      if (newPaidAmount.greaterThan(saleTotal)) {
        throw new BadRequestException('Payment amount exceeds remaining balance due');
      }

      // Insert payment
      await this.salesRepo.createPayment({
        saleId: sale.id,
        clientId: sale.clientId,
        userId: userId,
        amount: dto.amount.toString(),
        paymentMethod: dto.paymentMethod,
        referenceNumber: dto.referenceNumber,
        businessUnitId: tenantId,
      }, tx);

      // Decrease Client Debt
      if (sale.clientId) {
        await this.clientsRepo.decrementBalanceDue(sale.clientId, dto.amount, tenantId, tx);
      }

      // Update payment status if fully paid
      if (newPaidAmount.equals(saleTotal)) {
        await this.salesRepo.updatePaymentStatus(sale.id, 'PAID', tenantId, tx);
      } else {
        await this.salesRepo.updatePaymentStatus(sale.id, 'PARTIAL', tenantId, tx);
      }

      return { message: 'Payment successfully added' };
    });
  }

  async getDailySummary(dateString: string | undefined, tenantId: string) {
    const targetDate = dateString ? new Date(dateString) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(targetDate);
    nextDate.setDate(targetDate.getDate() + 1);

    const dto = {
      startDate: targetDate.toISOString(),
      endDate: nextDate.toISOString(),
      limit: 10000, // Large limit to fetch all for the day
      page: 1,
    } as unknown as GetSalesDto;
    
    const paginatedSales = await this.salesRepo.findAllSales(tenantId, dto);
    const dailySales = paginatedSales.items.filter((s: any) => s.status !== 'VOIDED');

    let totalRevenue = new Decimal(0);
    const breakdownByMethod: Record<string, number> = {
      CASH: 0,
      CARD: 0,
      TRANSFER: 0,
      CREDIT: 0,
    };

    dailySales.forEach((sale: any) => {
      const amount = new Decimal(sale.totalAmount);
      totalRevenue = totalRevenue.add(amount);
      breakdownByMethod[sale.paymentMethod] = new Decimal(breakdownByMethod[sale.paymentMethod] || 0).add(amount).toNumber();
    });

    return {
      totalSalesCount: dailySales.length,
      totalRevenue: totalRevenue.toNumber(),
      breakdownByMethod,
    };
  }
}
