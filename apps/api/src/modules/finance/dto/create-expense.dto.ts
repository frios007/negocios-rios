import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateExpenseSchema = z.object({
  description: z.string().min(2, 'Descripción debe tener al menos 2 caracteres'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0').max(99999999.99),
  categoryId: z.string().uuid().optional(),
  expenseDate: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'TRANSFER']).default('CASH'),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export class CreateExpenseDto extends createZodDto(CreateExpenseSchema) {}
