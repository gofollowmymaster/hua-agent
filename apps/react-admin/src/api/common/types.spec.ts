import { describe, expect, it } from 'vitest';
import { normalizePageParams } from './types';

describe('normalizePageParams', () => {
  it('maps ProTable current to backend page and keeps filters', () => {
    expect(
      normalizePageParams({ current: 3, pageSize: 50, keyword: '合同' }),
    ).toEqual({ page: 3, pageSize: 50, keyword: '合同' });
  });
});
