import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthenticatedRequest } from '@/modules/auth/interface/request-with-user.interface';

export const ActiveTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.tenantId) {
      throw new InternalServerErrorException('Tenant ID not found in request');
    }

    return request.tenantId;
  },
);
