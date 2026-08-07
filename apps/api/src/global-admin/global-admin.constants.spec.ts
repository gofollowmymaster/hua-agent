import { RequestMethod } from '@nestjs/common';
import { GLOBAL_ADMIN_TENANT_MIDDLEWARE_EXCLUSIONS } from './global-admin.constants';

describe('GLOBAL_ADMIN_TENANT_MIDDLEWARE_EXCLUSIONS', () => {
  it('excludes both API and static root/child paths for all methods', () => {
    expect(GLOBAL_ADMIN_TENANT_MIDDLEWARE_EXCLUSIONS).toEqual([
      { path: 'global-admin', method: RequestMethod.ALL },
      { path: 'global-admin/(.*)', method: RequestMethod.ALL },
      { path: 'public/global-admin', method: RequestMethod.ALL },
      { path: 'public/global-admin/(.*)', method: RequestMethod.ALL },
    ]);
  });
});
