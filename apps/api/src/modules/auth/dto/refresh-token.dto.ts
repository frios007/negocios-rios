import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const RefreshTokenSchema = z.object({
  refreshToken: z.uuid("Invalid refresh token format"),
});

export class RefreshTokenDto extends createZodDto(RefreshTokenSchema) {}
