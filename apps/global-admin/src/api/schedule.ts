import { get, post } from './http';

export type ScheduledTaskStatus = 'enabled' | 'disabled';
export type ScheduledTaskRunResult = 'success' | 'failed';

export interface ScheduledTaskSummary {
  taskKey: string;
  module: string;
  description: string;
  cron: string;
  status: ScheduledTaskStatus;
  lastRunTime: string | null;
  lastRunResult: ScheduledTaskRunResult | null;
}

export interface ScheduledTaskDetail extends ScheduledTaskSummary {
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledTaskLogItem {
  id: string;
  executeTime: string;
  result: ScheduledTaskRunResult;
  message: string | null;
  costMs: number | null;
}

export interface ScheduledTaskLogPage {
  list: ScheduledTaskLogItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListSchedulesParams {
  keyword?: string;
  status?: ScheduledTaskStatus;
}

export interface ListScheduleLogsParams {
  result?: ScheduledTaskRunResult;
  page?: number;
  pageSize?: number;
}

export function listSchedules(params: ListSchedulesParams = {}) {
  return get<ScheduledTaskSummary[]>('/global-admin/schedules', { params });
}

export function getSchedule(taskKey: string) {
  return get<ScheduledTaskDetail>(
    `/global-admin/schedules/${encodeURIComponent(taskKey)}`
  );
}

export function triggerSchedule(taskKey: string) {
  return post<ScheduledTaskDetail>(
    `/global-admin/schedules/${encodeURIComponent(taskKey)}/trigger`
  );
}

export function listScheduleLogs(
  taskKey: string,
  params: ListScheduleLogsParams = {}
) {
  return get<ScheduledTaskLogPage>(
    `/global-admin/schedules/${encodeURIComponent(taskKey)}/logs`,
    { params }
  );
}
