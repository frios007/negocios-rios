import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface PgError extends Error {
  code: string;
}

function isPgError(exception: unknown): exception is PgError {
  return (
    typeof exception === 'object' && exception !== null && 'code' in exception
  );
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        message = (exceptionResponse as { message: string | string[] }).message;
      } else {
        message = exception.message;
      }
    } else if (isPgError(exception)) {
      if (exception.code === '23505') {
        status = HttpStatus.CONFLICT;
        message = 'A record with this value already exists.';
      } else if (exception.code.startsWith('23')) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Database integrity constraint violation.';
      }
    }

    const errorLog =
      exception instanceof Error
        ? exception.stack || exception.message
        : String(exception);

    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${status} - Message: ${Array.isArray(message) ? message.join(', ') : message}`,
      errorLog,
    );

    response.status(status).json({
      status: status.toString().includes('4') ? 'fail' : 'error',
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
