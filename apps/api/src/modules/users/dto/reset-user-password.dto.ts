import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ResetUserPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100),
});

export class ResetUserPasswordDto extends createZodDto(ResetUserPasswordSchema) {}
