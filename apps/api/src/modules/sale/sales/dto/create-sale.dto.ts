import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SaleDetailSchema = z.object({
  productId: z.uuid('Invalid Product ID'),
  quantity: z.number().int().positive('Quantity must be greater than zero'),
});

export const CreateSaleSchema = z
  .object({
    clientId: z.uuid('Invalid Client ID').optional().nullable(),
    paymentMethod: z.enum(['CASH', 'CARD', 'TRANSFER', 'CREDIT']),
    amountPaid: z.number().min(0, 'Amount paid cannot be negative').default(0),
    details: z.array(SaleDetailSchema).min(1, 'Cart cannot be empty'),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === 'CREDIT' && !data.clientId) {
      ctx.addIssue({
        code: 'custom',
        message: 'A registered client is required for credit sales.',
        path: ['clientId'],
      });
    }
  });

export class CreateSaleDto extends createZodDto(CreateSaleSchema) {}
