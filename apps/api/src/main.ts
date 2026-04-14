import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Reflector } from "@nestjs/core";
import { TransformInterceptor } from "./core/interceptors/transform.interceptor";
import { AllExceptionsFilter } from "./core/filters/all-exceptions.filter";
import { ZodValidationPipe } from "nestjs-zod";
import { env } from "./core/config/env.schema";
import { Logger } from "@nestjs/common";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import express from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Negocios Rios Backend");

  app.use(helmet());
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));

  app.enableCors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  app.useGlobalPipes(new ZodValidationPipe());
  app.setGlobalPrefix("api/v1");

  const reflector = new Reflector();
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(env.PORT);
  logger.log(`Current environment: ${env.NODE_ENV.toUpperCase()}`);
  logger.log(`Server is running on port ${env.PORT}`);
}

void bootstrap();
