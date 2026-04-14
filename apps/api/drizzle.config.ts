import { config } from "dotenv";
config();
import { defineConfig } from "drizzle-kit";
import { env } from "@/core/config/env.schema";

export default defineConfig({
  schema: "./src/core/database/schemas/**/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
