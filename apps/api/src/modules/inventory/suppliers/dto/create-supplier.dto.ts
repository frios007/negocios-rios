import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateSupplierSchema = z.object({
  name: z.string().min(1),
  phoneNumber: z.string().optional(),
  email: z.email().optional(),
});

export class CreateSupplierDto extends createZodDto(CreateSupplierSchema) {}
