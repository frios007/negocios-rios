import { createZodDto } from 'nestjs-zod';
import { CreateSupplierSchema } from './create-supplier.dto';

export const UpdateSupplierSchema = CreateSupplierSchema.partial();
export class UpdateSupplierDto extends createZodDto(UpdateSupplierSchema) {}
