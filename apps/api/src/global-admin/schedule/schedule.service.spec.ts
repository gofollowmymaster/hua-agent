import { NotFoundException } from '@nestjs/common';
import { GlobalAdminScheduleService } from './schedule.service';

describe('GlobalAdminScheduleService', () => {
  let ragPrisma: {
    scheduledTask: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
    scheduledTaskLog: {
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };
  let registry: { getEntry: jest.Mock };
  let service: GlobalAdminScheduleService;

  const task = {
    id: BigInt(1),
    taskKey: 'Alert Statistic Per Day',
    module: '告警',
    description: '每日统计告警问题并推送卡片',
    cron: '0 45 17 * * *',
    status: 'enabled',
    lastRunTime: new Date('2026-08-07T09:00:00.000Z'),
    lastRunResult: 'success',
    createdAt: new Date('2026-08-07T08:00:00.000Z'),
    updatedAt: new Date('2026-08-07T09:00:00.000Z'),
  };

  const log = {
    id: BigInt(10),
    taskId: BigInt(1),
    executeTime: new Date('2026-08-07T09:00:00.000Z'),
    result: 'success',
    message: null,
    costMs: 120,
  };

  beforeEach(() => {
    ragPrisma = {
      scheduledTask: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      scheduledTaskLog: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };
    registry = { getEntry: jest.fn() };
    service = new GlobalAdminScheduleService(ragPrisma as any, registry as any);
  });

  it('lists tasks with keyword and status filters applied', async () => {
    ragPrisma.scheduledTask.findMany.mockResolvedValue([task]);

    const result = await service.list({ keyword: '告警', status: 'enabled' });

    expect(ragPrisma.scheduledTask.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { module: { contains: '告警' } },
          { description: { contains: '告警' } },
        ],
        status: 'enabled',
      },
      orderBy: { id: 'asc' },
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      taskKey: task.taskKey,
      module: '告警',
      cron: '0 45 17 * * *',
      status: 'enabled',
    });
  });

  it('returns task detail by taskKey', async () => {
    ragPrisma.scheduledTask.findUnique.mockResolvedValue(task);

    const result = await service.get(task.taskKey);

    expect(result).toMatchObject({
      taskKey: task.taskKey,
      description: '每日统计告警问题并推送卡片',
      lastRunResult: 'success',
    });
  });

  it('throws 404 when task does not exist', async () => {
    ragPrisma.scheduledTask.findUnique.mockResolvedValue(null);

    await expect(service.get('unknown')).rejects.toThrow(NotFoundException);
    await expect(
      service.listLogs('unknown', { page: 1, pageSize: 20 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('triggers the registered task and returns refreshed detail', async () => {
    const instance = { execute: jest.fn().mockResolvedValue(undefined) };
    registry.getEntry.mockReturnValue({ instance });
    ragPrisma.scheduledTask.findUnique
      .mockResolvedValueOnce(task)
      .mockResolvedValueOnce({
        ...task,
        lastRunTime: new Date('2026-08-07T10:00:00.000Z'),
      });

    const result = await service.trigger(task.taskKey);

    expect(instance.execute).toHaveBeenCalled();
    expect(result.lastRunTime).toEqual(new Date('2026-08-07T10:00:00.000Z'));
  });

  it('throws 404 when triggering an unregistered task', async () => {
    ragPrisma.scheduledTask.findUnique.mockResolvedValue(task);
    registry.getEntry.mockReturnValue(undefined);

    await expect(service.trigger(task.taskKey)).rejects.toThrow(
      NotFoundException,
    );
    expect(ragPrisma.scheduledTask.findUnique).toHaveBeenCalledTimes(1);
  });

  it('returns paginated logs with result filter and stringified ids', async () => {
    ragPrisma.scheduledTask.findUnique.mockResolvedValue(task);
    ragPrisma.scheduledTaskLog.findMany.mockResolvedValue([log]);
    ragPrisma.scheduledTaskLog.count.mockResolvedValue(1);

    const result = await service.listLogs(task.taskKey, {
      result: 'success',
      page: 2,
      pageSize: 20,
    });

    expect(ragPrisma.scheduledTaskLog.findMany).toHaveBeenCalledWith({
      where: { taskId: BigInt(1), result: 'success' },
      orderBy: { executeTime: 'desc' },
      skip: 20,
      take: 20,
    });
    expect(result).toEqual({
      list: [
        {
          id: '10',
          executeTime: log.executeTime,
          result: 'success',
          message: null,
          costMs: 120,
        },
      ],
      total: 1,
      page: 2,
      pageSize: 20,
    });
  });
});
