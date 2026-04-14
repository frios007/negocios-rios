import { SetMetadata } from '@nestjs/common';

export const SKIP_TENANT_KEY = 'skipTenant';
export const SkipTenantGuard = () => SetMetadata(SKIP_TENANT_KEY, true);
