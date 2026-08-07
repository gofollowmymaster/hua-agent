import { beforeEach, describe, expect, it, vi } from 'vitest';

const get = vi.hoisted(() => vi.fn());
vi.mock('./http', () => ({ get }));

import { getTenant, listTenants } from './global-admin';

describe('global admin tenant API', () => {
  beforeEach(() => get.mockReset());

  it('uses the no-tenant list endpoint', async () => {
    get.mockResolvedValue([]);
    await listTenants();
    expect(get).toHaveBeenCalledWith('/global-admin/tenants');
  });

  it('encodes the tenant code in detail requests', async () => {
    get.mockResolvedValue({});
    await getTenant('boat/test');
    expect(get).toHaveBeenCalledWith('/global-admin/tenants/boat%2Ftest');
  });
});
