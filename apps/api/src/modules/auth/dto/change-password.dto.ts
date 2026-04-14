import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, 'Current password must be at least 8 characters'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export class ChangePasswordDto extends createZodDto(ChangePasswordSchema) {}
