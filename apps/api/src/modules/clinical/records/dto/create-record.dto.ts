import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateRecordSchema = z.object({
  patientId: z.string().uuid(),
  weight: z.string().optional(),
  temperature: z.string().optional(),
  reason: z.string().min(1).max(255),
  diagnosis: z.string().optional(),
  prescription: z.string().optional(),
  internalNotes: z.string().optional(),
});

export class CreateRecordDto extends createZodDto(CreateRecordSchema) {}
