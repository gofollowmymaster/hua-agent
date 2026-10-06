import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/rag-client';
import { NotReportException } from '@src/common/exception/not-report-exception';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { RagPrismaService } from '@src/common/service/rag-prisma/rag-prisma.service';
import { AGENT_SYSTEM_SKILLS } from './agent-system-skill.catalog';
import type {
  CreateUserSkillDto,
  QuerySystemSkillDto,
  QueryUserSkillDto,
  UpdateUserSkillDto,
} from './dto/agent-skill.dto';
import type {
  AgentSkillInstruction,
  AgentUserSkillItem,
} from './type/agent-skill.type';

const MAX_ENABLED_USER_SKILLS = 20;
const MAX_ENABLED_INSTRUCTION_LENGTH = 30000;

/** 管理只读系统 Skill、用户私有 Skill 和运行时指令装载。 */
@Injectable()
export class AgentSkillService {
  /** 注入 RAG 数据库与当前租户用户上下文。 */
  constructor(
    private readonly ragPrisma: RagPrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  /** 返回匹配关键词的只读系统 Skill。 */
  listSystemSkills(query: QuerySystemSkillDto = {}) {
    const keyword = query.keyword?.toLocaleLowerCase();
    return AGENT_SYSTEM_SKILLS.filter((skill) => {
      if (!keyword) return true;
      return [skill.name, skill.description, skill.instruction].some((value) =>
        value.toLocaleLowerCase().includes(keyword),
      );
    });
  }

  /** 分页返回当前登录用户拥有的 Skill。 */
  async pageUserSkills(query: QueryUserSkillDto) {
    const owner = this.currentOwner();
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Prisma.AgentUserSkillWhereInput = {
      ...owner,
      ...(query.isEnabled === undefined ? {} : { isEnabled: query.isEnabled }),
      ...(query.keyword
        ? {
            OR: [
              { name: { contains: query.keyword, mode: 'insensitive' } },
              {
                description: {
                  contains: query.keyword,
                  mode: 'insensitive',
                },
              },
              {
                instruction: {
                  contains: query.keyword,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };
    const [total, skills] = await Promise.all([
      this.ragPrisma.agentUserSkill.count({ where }),
      this.ragPrisma.agentUserSkill.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return {
      list: skills.map((skill) => this.toUserSkillItem(skill)),
      total,
      page,
      pageSize,
    };
  }

  /** 创建当前登录用户的私有 Skill。 */
  async createUserSkill(dto: CreateUserSkillDto) {
    const owner = this.currentOwner();
    const data = {
      ...owner,
      name: dto.name.trim(),
      description: dto.description?.trim() ?? '',
      instruction: dto.instruction.trim(),
      isEnabled: dto.isEnabled ?? true,
    };
    if (data.isEnabled) {
      await this.assertEnabledLimits(owner, data.instruction);
    }
    try {
      const skill = await this.ragPrisma.agentUserSkill.create({ data });
      return this.toUserSkillItem(skill);
    } catch (error) {
      this.rethrowUniqueName(error);
    }
  }

  /** 修改当前登录用户拥有的 Skill。 */
  async updateUserSkill(id: number, dto: UpdateUserSkillDto) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('至少提供一个需要修改的字段');
    }
    const owner = this.currentOwner();
    const existing = await this.findOwnedSkill(id, owner);
    const nextInstruction = dto.instruction?.trim() ?? existing.instruction;
    const nextEnabled = dto.isEnabled ?? existing.isEnabled;
    if (nextEnabled) {
      await this.assertEnabledLimits(owner, nextInstruction, existing.id);
    }
    try {
      const skill = await this.ragPrisma.agentUserSkill.update({
        where: { id: existing.id },
        data: {
          ...(dto.name === undefined ? {} : { name: dto.name.trim() }),
          ...(dto.description === undefined
            ? {}
            : { description: dto.description.trim() }),
          ...(dto.instruction === undefined
            ? {}
            : { instruction: nextInstruction }),
          ...(dto.isEnabled === undefined ? {} : { isEnabled: dto.isEnabled }),
        },
      });
      return this.toUserSkillItem(skill);
    } catch (error) {
      this.rethrowUniqueName(error);
    }
  }

  /** 删除当前登录用户拥有的 Skill。 */
  async deleteUserSkill(id: number) {
    const owner = this.currentOwner();
    const existing = await this.findOwnedSkill(id, owner);
    await this.ragPrisma.agentUserSkill.delete({ where: { id: existing.id } });
  }

  /** 按运行时优先级返回系统与用户启用指令。 */
  async listEnabledInstructions(
    tenantCode: string,
    userId?: number,
  ): Promise<AgentSkillInstruction[]> {
    const instructions: AgentSkillInstruction[] = AGENT_SYSTEM_SKILLS.map(
      (skill) => ({
        key: skill.key,
        type: skill.type,
        name: skill.name,
        instruction: skill.instruction,
      }),
    );
    if (!userId) return instructions;

    const userSkills = await this.ragPrisma.agentUserSkill.findMany({
      where: { tenantCode, userId, isEnabled: true },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: { id: true, name: true, instruction: true },
    });
    return [
      ...instructions,
      ...userSkills.map((skill) => ({
        key: `user:${skill.id.toString()}`,
        type: 'user' as const,
        name: skill.name,
        instruction: skill.instruction,
      })),
    ];
  }

  /** 获取当前可信 JWT 用户的租户和用户 ID。 */
  private currentOwner() {
    const tenantCode = this.tenantContext.tenant;
    const userId = this.tenantContext.userId;
    if (!tenantCode || !userId) {
      throw new NotReportException('缺少可信的用户身份', 401);
    }
    return { tenantCode, userId };
  }

  /** 查询当前所有者的 Skill，避免通过 ID 越权访问。 */
  private async findOwnedSkill(
    id: number,
    owner: { tenantCode: string; userId: number },
  ) {
    const skill = await this.ragPrisma.agentUserSkill.findFirst({
      where: { id, ...owner },
    });
    if (!skill) throw new NotReportException('Skill 不存在', 404);
    return skill;
  }

  /** 校验启用数量和组合后的指令总长度。 */
  private async assertEnabledLimits(
    owner: { tenantCode: string; userId: number },
    instruction: string,
    excludedId?: bigint,
  ) {
    const enabled = await this.ragPrisma.agentUserSkill.findMany({
      where: {
        ...owner,
        isEnabled: true,
        ...(excludedId === undefined ? {} : { id: { not: excludedId } }),
      },
      select: { instruction: true },
    });
    if (enabled.length >= MAX_ENABLED_USER_SKILLS) {
      throw new BadRequestException(
        `最多启用 ${MAX_ENABLED_USER_SKILLS} 个用户 Skill`,
      );
    }
    const totalLength = enabled.reduce(
      (total, skill) => total + skill.instruction.length,
      instruction.length,
    );
    if (totalLength > MAX_ENABLED_INSTRUCTION_LENGTH) {
      throw new BadRequestException(
        `启用的用户 Skill 指令总长度不能超过 ${MAX_ENABLED_INSTRUCTION_LENGTH} 字`,
      );
    }
  }

  /** 将 Prisma BigInt 记录映射为稳定的 HTTP 返回结构。 */
  private toUserSkillItem(skill: {
    id: bigint;
    name: string;
    description: string;
    instruction: string;
    isEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): AgentUserSkillItem {
    return {
      id: Number(skill.id),
      type: 'user',
      name: skill.name,
      description: skill.description,
      instruction: skill.instruction,
      isEnabled: skill.isEnabled,
      readonly: false,
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt,
    };
  }

  /** 将唯一键冲突转换为可读的业务错误。 */
  private rethrowUniqueName(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new BadRequestException('Skill 名称已存在');
    }
    throw error;
  }
}
