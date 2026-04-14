import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE } from '../decorators/response-message.decorator';
import {
  PaginatedResult,
  PaginationMeta,
} from '../common/types/pagination.types';

export interface Response<T> {
  status: string;
  message: string;
  data: T | T[];
  meta?: PaginationMeta;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  constructor(private reflector: Reflector) {}

  private isPaginatedResult(res: unknown): res is PaginatedResult<T> {
    return (
      typeof res === 'object' && res !== null && 'items' in res && 'meta' in res
    );
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const message =
      this.reflector.get<string>(RESPONSE_MESSAGE, context.getHandler()) ||
      'Successful operation';

    return next.handle().pipe(
      map((res: unknown) => {
        if (this.isPaginatedResult(res)) {
          return {
            status: 'success',
            message,
            data: res.items,
            meta: res.meta,
          };
        }

        return {
          status: 'success',
          message,
          data: res as T,
        };
      }),
    );
  }
}
