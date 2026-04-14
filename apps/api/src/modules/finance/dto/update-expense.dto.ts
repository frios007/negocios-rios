import { createZodDto } from 'nestjs-zod';
import { CreateExpenseSchema } from './create-expense.dto';

export class UpdateExpenseDto extends createZodDto(
  CreateExpenseSchema.partial(),
) {}
