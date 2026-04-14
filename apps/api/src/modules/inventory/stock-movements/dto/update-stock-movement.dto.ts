import { createZodDto } from 'nestjs-zod';
import { CreateStockMovementSchema } from './create-stock-movement.dto';

export const UpdateStockMovementSchema = CreateStockMovementSchema.partial();
export class UpdateStockMovementDto extends createZodDto(UpdateStockMovementSchema) {}
