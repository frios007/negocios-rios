import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const CreatePatientSchema = z.object({
  name: z.string().min(1).max(100),
  species: z.string().min(1).max(50),
  breed: z.string().max(100).optional(),
  sex: z.enum(["Macho", "Hembra"]).optional(),
  color: z.string().max(50).optional(),
  dateOfBirth: z.coerce.date().optional(),
  clientId: z.uuid(),
});

export class CreatePatientDto extends createZodDto(CreatePatientSchema) {}
