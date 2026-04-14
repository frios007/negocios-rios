import { Request } from 'express';
import { roleEnum } from '@/core/database/schemas/core/core.tables';

export interface JwtPayload {
  sub: string;
  username: string;
  businessUnits: {
    businessUnitId: string;
    role: (typeof roleEnum.enumValues)[number];
  }[];
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
  tenantId?: string;
}
