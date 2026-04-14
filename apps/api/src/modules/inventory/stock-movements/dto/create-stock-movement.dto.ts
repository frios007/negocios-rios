import { movementTypes } from '@/core/database/schemas';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateStockMovementSchema = z.object({
  productId: z.uuid(),
  type: z.enum(movementTypes),
  quantity: z.coerce.number().min(1),
  batchNumber: z.string().optional(),
  expirationDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export class CreateStockMovementDto extends createZodDto(
  CreateStockMovementSchema,
) {}
