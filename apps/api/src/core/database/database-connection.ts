import { InjectionToken } from '@nestjs/common';

export const DATABASE_CONNECTION: InjectionToken =
  'database_connection' as const;
