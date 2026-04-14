import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateExpenseCategorySchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(100),
});

export class CreateExpenseCategoryDto extends createZodDto(CreateExpenseCategorySchema) {}
