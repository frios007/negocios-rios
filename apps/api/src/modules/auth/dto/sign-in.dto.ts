import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const SignInSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});

export class SignInDto extends createZodDto(SignInSchema) {}
