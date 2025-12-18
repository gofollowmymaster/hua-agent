import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import ClientSecretTable from '../table/client-secret-table';
import FeishuTableHelper from '../feishu/helper/table-helper';
import { ClientFactory, FeishuApp } from '../feishu/clients';
import { Request } from 'express';
import { RedisService } from '../service/redis/redis.service';
import { TenantContext } from '../service/context/tenant.context';

@Injectable()
export class SecretAuthGuard implements CanActivate {
  private clientSecretTable: ClientSecretTable;
  constructor(
    protected redisService: RedisService,
    protected readonly userContext: TenantContext,
  ) {
    this.clientSecretTable = new ClientSecretTable(
      new FeishuTableHelper(
        ClientFactory.create(FeishuApp.AlertClient),
        userContext,
        redisService,
      ),
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      await this.verify(token);
    } catch (err) {
      throw new UnauthorizedException('无效的认证密钥');
    }
    return true;
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const token = request.headers.authorization;
    return token;
  }

  private async verify(token: string) {
    const { fields: appInfo } = await this.clientSecretTable.get(token);

    if (!appInfo.是否启用) {
      throw new UnauthorizedException('认证密钥已失效');
    }
    return true;
  }
}
