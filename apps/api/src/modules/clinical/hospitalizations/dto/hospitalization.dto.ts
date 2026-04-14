import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateHospitalizationSchema = z.object({
  patientId: z.string().uuid(),
  reason: z.string().min(1).max(255),
  diagnosis: z.string().optional(),
  estimatedDays: z.number().int().positive().optional(),
  dailyRate: z.string().optional(),
  // Optional initial vitals
  weight: z.string().optional(),
  temperature: z.string().optional(),
});

export class CreateHospitalizationDto extends createZodDto(
  CreateHospitalizationSchema,
) {}

const DischargeHospitalizationSchema = z.object({
  dischargeNotes: z.string().optional(),
});

export class DischargeHospitalizationDto extends createZodDto(
  DischargeHospitalizationSchema,
) {}

const AddNoteSchema = z.object({
  weight: z.string().optional(),
  temperature: z.string().optional(),
  observations: z.string().min(1),
  treatment: z.string().optional(),
});

export class AddNoteDto extends createZodDto(AddNoteSchema) {}

const AddItemSchema = z.object({
  description: z.string().min(1).max(255),
  quantity: z.number().int().positive().default(1),
  unitPrice: z.string(),
});

export class AddItemDto extends createZodDto(AddItemSchema) {}

const UpdateHospitalizationSchema = z.object({
  diagnosis: z.string().nullable().optional(),
  estimatedDays: z.number().int().positive().nullable().optional(),
  dailyRate: z.string().nullable().optional(),
});

export class UpdateHospitalizationDto extends createZodDto(
  UpdateHospitalizationSchema,
) {}

const GenerateBillSchema = z.object({
  paymentMethod: z.enum(['CASH', 'CARD', 'TRANSFER', 'CREDIT']).default('CASH'),
});

export class GenerateBillDto extends createZodDto(GenerateBillSchema) {}
