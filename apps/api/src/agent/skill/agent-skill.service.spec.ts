import { BadRequestException } from '@nestjs/common';
import { AgentSkillService } from './agent-skill.service';

describe('AgentSkillService', () => {
  const agentUserSkill = {
    count: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const ragPrisma = { agentUserSkill };
  const tenantContext = { tenant: 'yurex', userId: 7 };
  let service: AgentSkillService;

  beforeEach(() => {
    jest.clearAllMocks();
    agentUserSkill.findMany.mockResolvedValue([]);
    agentUserSkill.count.mockResolvedValue(0);
    service = new AgentSkillService(ragPrisma as any, tenantContext as any);
  });

  it('returns the four read-only system skills in catalog order', () => {
    expect(service.listSystemSkills().map((skill) => skill.key)).toEqual([
      'business-knowledge',
      'ds-order',
      'current-time',
      'calculator',
    ]);
    expect(service.listSystemSkills({ keyword: '订单' })).toHaveLength(1);
  });

  it('creates a normalized skill for the current owner', async () => {
    agentUserSkill.create.mockResolvedValue(skillRecord());
    await expect(
      service.createUserSkill({
        name: '  每日报告  ',
        description: ' 生成日报 ',
        instruction: ' 汇总今日订单 ',
      }),
    ).resolves.toMatchObject({ id: 1, type: 'user', readonly: false });
    expect(agentUserSkill.create).toHaveBeenCalledWith({
      data: {
        tenantCode: 'yurex',
        userId: 7,
        name: '每日报告',
        description: '生成日报',
        instruction: '汇总今日订单',
        isEnabled: true,
      },
    });
  });

  it('limits all writes to the current tenant and user', async () => {
    agentUserSkill.findFirst.mockResolvedValue(null);
    await expect(service.deleteUserSkill(9)).rejects.toMatchObject({
      message: expect.stringContaining('Skill 不存在'),
    });
    expect(agentUserSkill.findFirst).toHaveBeenCalledWith({
      where: { id: 9, tenantCode: 'yurex', userId: 7 },
    });
    expect(agentUserSkill.delete).not.toHaveBeenCalled();
  });

  it('rejects enabling more than twenty personal skills', async () => {
    agentUserSkill.findMany.mockResolvedValue(
      Array.from({ length: 20 }, () => ({ instruction: 'x' })),
    );
    await expect(
      service.createUserSkill({ name: '超限', instruction: 'x' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('loads only system skills without a trusted user id', async () => {
    const skills = await service.listEnabledInstructions('yurex');
    expect(skills).toHaveLength(4);
    expect(agentUserSkill.findMany).not.toHaveBeenCalled();
  });

  it('appends enabled personal skills after system skills', async () => {
    agentUserSkill.findMany.mockResolvedValue([
      { id: 3n, name: '个人流程', instruction: '执行个人流程' },
    ]);
    const skills = await service.listEnabledInstructions('yurex', 7);
    expect(skills.at(-1)).toEqual({
      key: 'user:3',
      type: 'user',
      name: '个人流程',
      instruction: '执行个人流程',
    });
    expect(agentUserSkill.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantCode: 'yurex', userId: 7, isEnabled: true },
      }),
    );
  });
});

function skillRecord() {
  return {
    id: 1n,
    tenantCode: 'yurex',
    userId: 7,
    name: '每日报告',
    description: '生成日报',
    instruction: '汇总今日订单',
    isEnabled: true,
    createdAt: new Date('2026-10-06T00:00:00.000Z'),
    updatedAt: new Date('2026-10-06T00:00:00.000Z'),
  };
}
