import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { paymentMethodEnum } from '@/core/database/schemas/sales/sales.tables';

export const CreatePaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['CASH','CARD','TRANSFER']),
  referenceNumber: z.string().max(255).optional(),
});

export class CreatePaymentDto extends createZodDto(CreatePaymentSchema) {}
