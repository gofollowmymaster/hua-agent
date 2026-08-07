import { RequestMethod } from '@nestjs/common';
import type { RouteInfo } from '@nestjs/common/interfaces';

export const GLOBAL_ADMIN_ROUTE_PREFIX = 'global-admin';
export const GLOBAL_ADMIN_STATIC_ROUTE_PREFIX = 'public/global-admin';

/** TenantMiddleware 不应处理的无租户总控台路由。 */
export const GLOBAL_ADMIN_TENANT_MIDDLEWARE_EXCLUSIONS: RouteInfo[] = [
  { path: GLOBAL_ADMIN_ROUTE_PREFIX, method: RequestMethod.ALL },
  { path: `${GLOBAL_ADMIN_ROUTE_PREFIX}/(.*)`, method: RequestMethod.ALL },
  { path: GLOBAL_ADMIN_STATIC_ROUTE_PREFIX, method: RequestMethod.ALL },
  {
    path: `${GLOBAL_ADMIN_STATIC_ROUTE_PREFIX}/(.*)`,
    method: RequestMethod.ALL,
  },
];
