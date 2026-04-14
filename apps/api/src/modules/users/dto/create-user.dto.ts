import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100),
  phoneNumber: z.string().max(20).optional(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100),
  role: z.enum(['OWNER', 'ADMIN', 'VET', 'PHARMACIST', 'CASHIER']),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
