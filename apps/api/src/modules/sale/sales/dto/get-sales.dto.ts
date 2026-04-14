import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { PaginationSchema } from "@/core/dto/pagination.dto";
import { paymentStatusEnum } from "@/core/database/schemas/sales/sales.tables";

export const GetSalesSchema = PaginationSchema.extend({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  paymentStatus: z.enum(paymentStatusEnum.enumValues).optional(),
  clientId: z.uuid().optional(),
  userId: z.uuid().optional(),
});

export class GetSalesDto extends createZodDto(GetSalesSchema) {}
