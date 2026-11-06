import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateUserRoleSchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'PHARMACIST', 'CASHIER']),
});

export class UpdateUserRoleDto extends createZodDto(UpdateUserRoleSchema) {}
