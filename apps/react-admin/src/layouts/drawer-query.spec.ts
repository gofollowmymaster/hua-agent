import { describe, expect, it } from 'vitest';
import { readDrawerQuery, updateDrawerQuery } from './drawer-query';

describe('drawer query', () => {
  it('preserves unrelated query params while opening and closing', () => {
    const opened = updateDrawerQuery('?keyword=a', {
      drawer: 'document-chunks',
      drawerCode: 12,
    });
    expect(readDrawerQuery(opened)).toEqual({
      drawer: 'document-chunks',
      drawerCode: '12',
    });
    expect(updateDrawerQuery(opened)).toBe('?keyword=a');
  });
});
