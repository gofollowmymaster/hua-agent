import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { TenantContext } from '../service/context/tenant.context';
import { UserContext } from '@src/type/global';
import { TenantCode, tenantCodeMap } from '@src/config/tenant';
import ClientSecretTable from '../table/client-secret-table';
import { ClientFactory, FeishuApp } from '../feishu/clients';
import FeishuTableHelper from '../feishu/helper/table-helper';
import { RedisService } from '../service/redis/redis.service';
import { sendExceptionToFeishu } from '../feishu/utils';
import { NodeConfigService } from '@src/config/node-config.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private clientSecretTable: ClientSecretTable;

  constructor(
    private jwtService: JwtService,
    private readonly asyncStorage: TenantContext,
    protected redisService: RedisService,
  ) {
    this.clientSecretTable = new ClientSecretTable(
      new FeishuTableHelper(
        ClientFactory.create(FeishuApp.AlertClient),
        { tenant: NodeConfigService.get('defaultTenant') } as TenantContext,
        redisService,
      ),
    );
  }
  async use(req: Request, _res: Response, next: NextFunction) {
    // 从不同来源获取租户ID
    const user = await this.extractTokenFromHeader(req);

    // 设置租户上下文 默认为小往
    const context = {
      tenantCode:
        tenantCodeMap[user.supplierCode as TenantCode] ||
        NodeConfigService.get('defaultTenant'),
      user: user || {},
    };
    this.asyncStorage.run(context, () => {
      next();
    });
  }

  private async extractTokenFromHeader(request: Request): Promise<UserContext> {
    if (request.headers.supplier) {
      return {
        supplierCode: request.headers.supplier as string,
      };
    }
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    const headerToken = type === 'Bearer' ? token : type;
    let payload;
    if (type == 'Bearer') {
      payload = await this.jwtService.decode(headerToken);
    } else {
      try {
        const { fields: appInfo } =
          await this.clientSecretTable.get(headerToken);

        payload = {
          supplierCode: appInfo.服务商,
        };
      } catch (e) {
        sendExceptionToFeishu(e);
        payload = {};
      }
    }
    return payload || {};
  }
}
