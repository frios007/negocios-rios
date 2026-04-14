import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/core/decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '@/modules/auth/decorators/auth.decorator';
import { AuthenticatedRequest } from '@/modules/auth/interface/request-with-user.interface';
import { UserRole } from '@/core/database/schemas/core/core.tables';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no @Roles() decorator is present, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const tenantId = request.tenantId;

    if (!tenantId) {
      throw new ForbiddenException(
        'A business unit context is required for role-based access',
      );
    }

    // Find the user's role for the specific tenant
    const tenantAccess = user.businessUnits.find(
      (unit) => unit.businessUnitId === tenantId,
    );

    if (!tenantAccess) {
      throw new ForbiddenException('Access denied to this business unit');
    }

    const hasRole = requiredRoles.includes(tenantAccess.role);

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have the required role to perform this action',
      );
    }

    return true;
  }
}
