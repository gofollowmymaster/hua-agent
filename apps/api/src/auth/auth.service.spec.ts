import { JwtService } from '@nestjs/jwt';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { RagPrismaService } from '@src/common/service/rag-prisma/rag-prisma.service';
import { NodeConfigService } from '@src/config/node-config.service';
import { tenantCodeMap } from '@src/config/tenant';
import { NotReportException } from '@src/common/exception/not-report-exception';
import { AuthService } from './auth.service';
import { hashPassword } from './password.util';

describe('AuthService', () => {
  const jwtService = {
    sign: jest.fn(() => 'signed-token'),
  } as unknown as JwtService;
  const tenantContext = {
    tenant: tenantCodeMap.D,
  } as TenantContext;
  const ragPrisma = {
    ragAdminUser: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
  } as unknown as RagPrismaService;
  const service = new AuthService(ragPrisma, jwtService, tenantContext);

  beforeEach(() => jest.clearAllMocks());

  afterEach(() => jest.restoreAllMocks());

  it('rejects a bootstrap password that cannot pass login validation', async () => {
    jest.spyOn(NodeConfigService, 'get').mockReturnValue({
      username: 'admin',
      password: 'short',
      supplierCode: 'D',
      displayName: 'Admin',
      resetPassword: false,
    });

    await expect(service.onModuleInit()).rejects.toBeInstanceOf(
      NotReportException,
    );
  });

  it('issues a JWT with the existing user and tenant claims', async () => {
    (ragPrisma.ragAdminUser.findUnique as jest.Mock).mockResolvedValue({
      id: 7,
      username: 'alice',
      displayName: 'Alice',
      tenantCode: tenantCodeMap.D,
      supplierCode: 'D',
      passwordHash: await hashPassword('password123'),
      isEnabled: true,
      isSystemAdmin: true,
    });

    await expect(
      service.login({ username: 'alice', password: 'password123' }),
    ).resolves.toEqual({ token: 'signed-token' });

    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 7,
        userCode: 'alice',
        username: 'Alice',
        supplierCode: 'D',
        tenantCode: tenantCodeMap.D,
        appCode: 'ADMIN',
        scope: 'WEB',
        isSystemAdmin: true,
        loginTime: expect.any(Number),
      }),
    );
  });

  it('returns the same credential error for missing and disabled users', async () => {
    (ragPrisma.ragAdminUser.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      service.login({ username: 'missing', password: 'password123' }),
    ).rejects.toBeInstanceOf(NotReportException);
  });

  it('rejects user updates outside the current tenant', async () => {
    (ragPrisma.ragAdminUser.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      service.updateUser(99, { isEnabled: false }),
    ).rejects.toBeInstanceOf(NotReportException);
  });
});
