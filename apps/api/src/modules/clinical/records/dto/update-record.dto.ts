import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdateRecordSchema = z.object({
  weight: z.string().optional(),
  temperature: z.string().optional(),
  reason: z.string().min(1).max(255).optional(),
  diagnosis: z.string().nullable().optional(),
  prescription: z.string().nullable().optional(),
  internalNotes: z.string().nullable().optional(),
  status: z.enum(['CONSULTATION', 'ADMITTED', 'DISCHARGED', 'CANCELLED']).optional(),
});

export class UpdateRecordDto extends createZodDto(UpdateRecordSchema) {}
