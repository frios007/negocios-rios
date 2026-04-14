import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const AssignUserSchema = z.object({
  businessUnitId: z.uuid("Invalid Business Unit ID"),
  role: z.enum(["OWNER", "ADMIN", "VET", "PHARMACIST", "CASHIER"]),
});

export class AssignUserDto extends createZodDto(AssignUserSchema) {}
