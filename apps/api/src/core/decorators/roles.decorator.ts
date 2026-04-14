import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@/core/database/schemas/core/core.tables';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
