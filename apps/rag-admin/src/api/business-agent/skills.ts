import { del, get, post } from '../common/http';
import { normalizeGridPageParams } from '../common/types';
import type { GridPageResult, PageResult } from '../common/types';

export interface SystemSkillItem {
  key: string;
  type: 'system';
  name: string;
  description: string;
  instruction: string;
  isEnabled: true;
  readonly: true;
}

export interface UserSkillItem {
  id: number;
  type: 'user';
  name: string;
  description: string;
  instruction: string;
  isEnabled: boolean;
  readonly: false;
  createdAt: string;
  updatedAt: string;
}

export interface SaveUserSkillParams {
  name: string;
  description?: string;
  instruction: string;
  isEnabled?: boolean;
}

export function listSystemSkills(keyword?: string) {
  return get<SystemSkillItem[]>('/agent/skills/system', {
    params: keyword ? { keyword } : undefined
  });
}

export async function pageSystemSkillsGrid(params: Record<string, unknown>) {
  const list = await listSystemSkills(
    typeof params.keyword === 'string' ? params.keyword : undefined
  );
  return {
    records: list,
    total: list.length
  } satisfies GridPageResult<SystemSkillItem>;
}

export function pageUserSkills(params: Record<string, unknown>) {
  return post<PageResult<UserSkillItem>>(
    '/agent/skills/user/page',
    normalizeGridPageParams(params)
  );
}

export async function pageUserSkillsGrid(params: Record<string, unknown>) {
  const result = await pageUserSkills(params);
  return {
    records: result.list,
    total: result.total
  } satisfies GridPageResult<UserSkillItem>;
}

export function createUserSkill(params: SaveUserSkillParams) {
  return post<UserSkillItem>('/agent/skills/user', params);
}

export function updateUserSkill(
  id: number,
  params: Partial<SaveUserSkillParams>
) {
  return post<UserSkillItem>(`/agent/skills/user/${id}`, params);
}

export function deleteUserSkill(id: number) {
  return del(`/agent/skills/user/${id}`);
}
