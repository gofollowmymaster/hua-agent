import { SetMetadata } from '@nestjs/common';

export const SCHEDULE_INFO_KEY = 'schedule:info';

/** 定时任务元数据：模块归属与功能描述，由 BaseSchedule 启动时收集。 */
export interface ScheduleInfoMetadata {
  module: string;
  description: string;
}

/** 标记 BaseSchedule 子类的模块与功能描述，供定时任务注册表收集入库。 */
export const ScheduleInfo = (metadata: ScheduleInfoMetadata) =>
  SetMetadata(SCHEDULE_INFO_KEY, metadata);
