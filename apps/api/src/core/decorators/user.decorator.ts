import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthenticatedRequest } from '@/modules/auth/interface/request-with-user.interface';

export const CurrentUser = createParamDecorator(
  (data: 'full' | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user || !request.user.sub) {
      throw new InternalServerErrorException(
        'User ID (sub) not found in request payload',
      );
    }

    // Return the full JWT payload if 'full' is specified
    if (data === 'full') {
      return request.user;
    }

    return request.user.sub;
  },
);
