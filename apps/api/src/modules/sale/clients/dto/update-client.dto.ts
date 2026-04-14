import { createZodDto } from 'nestjs-zod';
import { CreateClientSchema } from './create-client.dto';

export class UpdateClientDto extends createZodDto(
  CreateClientSchema.partial(),
) {}
