import { JwtSignOptions } from "@nestjs/jwt";
import { config } from "dotenv";
config();
import { z } from "zod";

type StringValue = Extract<JwtSignOptions["expiresIn"], string>;

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3005),
  CORS_ORIGIN: z.url(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_EXPIRATION: z
    .string()
    .transform((v) => v as StringValue)
    .default("15m" as StringValue),
  JWT_REFRESH_EXPIRATION: z
    .string()
    .transform((v) => v as StringValue)
    .default("7d" as StringValue),
  SEED_OWNER_PASSWORD: z.string(),
});

export const env = envSchema.parse(process.env);
