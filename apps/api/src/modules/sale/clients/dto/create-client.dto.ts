import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateClientSchema = z.object({
  firstName: z.string().min(2, 'Name must be at least 2 characters'),
  lastName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  documentId: z.string().min(10, 'Provide a valid Document id').optional(),
  phoneNumber: z.string().min(8, 'Provide a valid phone number').optional(),
  creditLimit: z.number().min(0).max(99999999.99, 'Límite de crédito excede el máximo permitido').default(0),
});

export class CreateClientDto extends createZodDto(CreateClientSchema) {}
