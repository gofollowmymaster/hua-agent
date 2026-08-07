import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { NodeConfigService } from '@src/config/node-config.service';
import { AuthGuard } from './auth';
import { GlobalAdminGuard } from './global-admin';

describe('GlobalAdminGuard', () => {
  let authGuard: { canActivate: jest.Mock };
  let guard: GlobalAdminGuard;
  let request: { user?: { appCode?: string } };
  let context: ExecutionContext;

  beforeEach(() => {
    jest
      .spyOn(NodeConfigService, 'get')
      .mockImplementation((key) =>
        key === 'globalAdminAppCode' ? 'GLOBAL' : undefined,
      );
    authGuard = { canActivate: jest.fn().mockResolvedValue(true) };
    guard = new GlobalAdminGuard(authGuard as unknown as AuthGuard);
    request = {};
    context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as ExecutionContext;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('allows an authenticated GLOBAL application user', async () => {
    request.user = { appCode: 'GLOBAL' };

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(authGuard.canActivate).toHaveBeenCalledWith(context);
  });

  it('rejects an authenticated user from another application', async () => {
    request.user = { appCode: 'ADMIN' };

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('propagates authentication failures before checking appCode', async () => {
    const error = new Error('invalid token');
    authGuard.canActivate.mockRejectedValue(error);

    await expect(guard.canActivate(context)).rejects.toBe(error);
  });

  it('does not authorize when the delegated guard returns false', async () => {
    authGuard.canActivate.mockResolvedValue(false);

    await expect(guard.canActivate(context)).resolves.toBe(false);
  });
});
