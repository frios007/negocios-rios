import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1),
  barcode: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.uuid().optional(),
  supplierId: z.uuid().optional(),
  costPrice: z.coerce.number().min(0).multipleOf(0.01),
  profitMargin: z.coerce.number().min(0).max(999.99),
  productType: z.enum(['GOODS', 'SERVICE']).default('GOODS'),
  isRegulated: z.boolean(),
  isSample: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export class CreateProductDto extends createZodDto(CreateProductSchema) {}
