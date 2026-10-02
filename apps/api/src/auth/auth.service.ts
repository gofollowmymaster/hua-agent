import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { RagPrismaService } from '@src/common/service/rag-prisma/rag-prisma.service';
import { NodeConfigService } from '@src/config/node-config.service';
import { TenantCode, tenantCodeMap } from '@src/config/tenant';
import { NotReportException } from '@src/common/exception/not-report-exception';
import {
  CreateRagAdminUserDto,
  LoginDto,
  QueryRagAdminUserDto,
  ResetRagAdminUserPasswordDto,
  UpdateRagAdminUserDto,
} from './dto/auth.dto';
import { hashPassword, verifyPassword } from './password.util';
import type { RagAdminUserSummary } from './type/rag-admin-user.type';

const tenantIdentity: Record<
  TenantCode,
  { supplierCode: string; supplierName: string; tenantName: string }
> = {
  [tenantCodeMap.A]: {
    supplierCode: 'A',
    supplierName: 'Aplus',
    tenantName: 'Aplus',
  },
  [tenantCodeMap.C]: {
    supplierCode: 'C',
    supplierName: 'Boat',
    tenantName: 'Boat',
  },
  [tenantCodeMap.D]: {
    supplierCode: 'D',
    supplierName: 'Yurex',
    tenantName: 'Yurex',
  },
};

/** 管理本地用户、系统管理员初始化和兼容既有 claims 的 JWT 签发。 */
@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly ragPrisma: RagPrismaService,
    private readonly jwtService: JwtService,
    private readonly tenantContext: TenantContext,
  ) {}

  /** 启动时按安全环境变量创建首次系统管理员，除非显式开启否则不覆盖密码。 */
  async onModuleInit() {
    const bootstrap = NodeConfigService.get('bootstrapAdmin');
    if (!bootstrap.username && !bootstrap.password) return;
    if (!bootstrap.username || !bootstrap.password) {
      throw new NotReportException(
        'RAG_ADMIN_BOOTSTRAP_USERNAME and RAG_ADMIN_BOOTSTRAP_PASSWORD must be configured together',
      );
    }
    if (bootstrap.password.length < 8 || bootstrap.password.length > 128) {
      throw new NotReportException(
        'RAG_ADMIN_BOOTSTRAP_PASSWORD must be between 8 and 128 characters',
      );
    }

    const tenantCode = this.tenantCodeFromSupplier(bootstrap.supplierCode);
    const identity = tenantIdentity[tenantCode];
    const existing = await this.ragPrisma.ragAdminUser.findUnique({
      where: {
        tenantCode_username: {
          tenantCode,
          username: bootstrap.username,
        },
      },
    });

    if (!existing) {
      await this.ragPrisma.ragAdminUser.create({
        data: {
          tenantCode,
          supplierCode: identity.supplierCode,
          username: bootstrap.username,
          displayName: bootstrap.displayName || bootstrap.username,
          passwordHash: await hashPassword(bootstrap.password),
          isSystemAdmin: true,
        },
      });
      return;
    }

    if (bootstrap.resetPassword) {
      await this.ragPrisma.ragAdminUser.update({
        where: { id: existing.id },
        data: {
          displayName: bootstrap.displayName || existing.displayName,
          passwordHash: await hashPassword(bootstrap.password),
          isEnabled: true,
          isSystemAdmin: true,
        },
      });
    }
  }

  /** 校验当前租户凭据并签发与既有 API Guard 兼容的 JWT。 */
  async login(dto: LoginDto) {
    const tenantCode = this.currentTenant();
    const username = dto.username.trim();
    const user = await this.ragPrisma.ragAdminUser.findUnique({
      where: { tenantCode_username: { tenantCode, username } },
    });
    if (
      !user ||
      !user.isEnabled ||
      !(await verifyPassword(dto.password, user.passwordHash))
    ) {
      throw new NotReportException('无效账号或密码', 401);
    }

    return { token: this.createToken(user) };
  }

  /** 返回仅属于当前租户的用户分页列表。 */
  async listUsers(dto: QueryRagAdminUserDto) {
    const tenantCode = this.currentTenant();
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? 20;
    const keyword = dto.keyword?.trim();
    const where = {
      tenantCode,
      ...(keyword
        ? {
            OR: [
              { username: { contains: keyword, mode: 'insensitive' as const } },
              {
                displayName: {
                  contains: keyword,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };
    const [total, users] = await Promise.all([
      this.ragPrisma.ragAdminUser.count({ where }),
      this.ragPrisma.ragAdminUser.findMany({
        where,
        select: this.userSummarySelection(),
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { list: users, total, page, pageSize };
  }

  /** 创建当前租户的新用户，默认不授予系统管理员权限。 */
  async createUser(dto: CreateRagAdminUserDto) {
    const tenantCode = this.currentTenant();
    const username = dto.username.trim();
    const existing = await this.ragPrisma.ragAdminUser.findUnique({
      where: { tenantCode_username: { tenantCode, username } },
      select: { id: true },
    });
    if (existing) throw new BadRequestException('用户名已存在');

    const user = await this.ragPrisma.ragAdminUser.create({
      data: {
        tenantCode,
        supplierCode: tenantIdentity[tenantCode].supplierCode,
        username,
        displayName: dto.displayName.trim(),
        passwordHash: await hashPassword(dto.password),
      },
      select: this.userSummarySelection(),
    });
    return user;
  }

  /** 修改当前租户用户的显示名或启用状态。 */
  async updateUser(id: number, dto: UpdateRagAdminUserDto) {
    const user = await this.findTenantUser(id);
    return this.ragPrisma.ragAdminUser.update({
      where: { id: user.id },
      data: {
        ...(dto.displayName === undefined
          ? {}
          : { displayName: dto.displayName.trim() }),
        ...(dto.isEnabled === undefined ? {} : { isEnabled: dto.isEnabled }),
      },
      select: this.userSummarySelection(),
    });
  }

  /** 重置当前租户用户的本地登录密码。 */
  async resetUserPassword(id: number, dto: ResetRagAdminUserPasswordDto) {
    const user = await this.findTenantUser(id);
    await this.ragPrisma.ragAdminUser.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(dto.password) },
    });
  }

  /** 生成已有 Guard 和 TenantMiddleware 所依赖的用户与租户 claims。 */
  private createToken(user: {
    id: number;
    username: string;
    displayName: string;
    tenantCode: string;
    supplierCode: string;
    isSystemAdmin: boolean;
  }) {
    const tenantCode = user.tenantCode as TenantCode;
    const identity = tenantIdentity[tenantCode];
    return this.jwtService.sign({
      userId: user.id,
      userCode: user.username,
      username: user.displayName,
      loginId: user.username,
      supplierCode: user.supplierCode,
      supplierName: identity.supplierName,
      tenantCode,
      tenantName: identity.tenantName,
      appCode: 'ADMIN',
      scope: 'WEB',
      isSystemAdmin: user.isSystemAdmin,
      loginTime: Math.floor(Date.now() / 1000),
    });
  }

  /** 查找当前租户用户，防止 ID 被用于跨租户读写。 */
  private async findTenantUser(id: number) {
    const user = await this.ragPrisma.ragAdminUser.findFirst({
      where: { id, tenantCode: this.currentTenant() },
    });
    if (!user) throw new NotReportException('用户不存在', 404);
    return user;
  }

  /** 获取请求租户，并在非 HTTP 上下文中回退到默认租户。 */
  private currentTenant(): TenantCode {
    return this.tenantContext.tenant ?? NodeConfigService.get('defaultTenant');
  }

  /** 将部署配置中的服务商码转换为内部租户码。 */
  private tenantCodeFromSupplier(supplierCode: string): TenantCode {
    const normalized = supplierCode.trim().toUpperCase();
    const tenantCode = tenantCodeMap[normalized as keyof typeof tenantCodeMap];
    if (!tenantCode) {
      throw new NotReportException(
        'RAG_ADMIN_BOOTSTRAP_SUPPLIER_CODE must be A, C, or D',
      );
    }
    return tenantCode;
  }

  /** 集中声明绝不返回密码哈希的用户查询字段。 */
  private userSummarySelection(): Record<keyof RagAdminUserSummary, true> {
    return {
      id: true,
      username: true,
      displayName: true,
      isEnabled: true,
      isSystemAdmin: true,
      createdAt: true,
      updatedAt: true,
    };
  }
}
