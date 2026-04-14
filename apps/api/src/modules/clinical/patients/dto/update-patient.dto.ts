import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const UpdatePatientSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  species: z.string().min(1).max(50).optional(),
  breed: z.string().max(100).nullable().optional(),
  sex: z.enum(["Macho", "Hembra"]).nullable().optional(),
  color: z.string().max(50).nullable().optional(),
  dateOfBirth: z.coerce.date().nullable().optional(),
  clientId: z.uuid().optional(),
  isActive: z.boolean().optional(),
});

export class UpdatePatientDto extends createZodDto(UpdatePatientSchema) {}
