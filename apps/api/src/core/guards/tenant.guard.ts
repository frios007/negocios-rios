import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { IS_PUBLIC_KEY } from '@/modules/auth/decorators/auth.decorator';
import { SKIP_TENANT_KEY } from '@/core/decorators/skip-tenant.decorator';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest } from '@/modules/auth/interface/request-with-user.interface';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const skipTenant = this.reflector.getAllAndOverride<boolean>(SKIP_TENANT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipTenant) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const headerValue = request.headers['x-business-unit-id'];

    if (!headerValue || typeof headerValue !== 'string' || !UUID_REGEX.test(headerValue)) {
      throw new BadRequestException(
        'X-Business-Unit-ID header is mandatory and must be a valid UUID',
      );
    }

    const tenantId = headerValue;
    const user = request.user;
    const hasAccess = user.businessUnits.some(
      (unit) => unit.businessUnitId === tenantId,
    );

    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this business unit');
    }

    request['tenantId'] = tenantId;

    return true;
  }
}
