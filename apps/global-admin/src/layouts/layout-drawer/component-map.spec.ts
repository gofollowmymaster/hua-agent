import { describe, expect, it } from 'vitest';
import { resolveDrawerFromQuery } from './component-map';

describe('resolveDrawerFromQuery', () => {
  it('restores tenant details from a valid URL query', () => {
    expect(
      resolveDrawerFromQuery({
        drawer: 'tenant-detail',
        drawerCode: 'boat'
      })
    ).toMatchObject({ data: { drawerCode: 'boat' } });
  });

  it('ignores incomplete or unknown drawer queries', () => {
    expect(resolveDrawerFromQuery({ drawer: 'tenant-detail' })).toBeNull();
    expect(
      resolveDrawerFromQuery({ drawer: 'unknown', drawerCode: 'boat' })
    ).toBeNull();
  });
});
