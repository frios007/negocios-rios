import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ResetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {}
