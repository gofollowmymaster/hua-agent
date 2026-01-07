import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
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
import { logger } from '../service/logger/logger.config';

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
      request: req,
    };

    this.asyncStorage.run(context, () => {
      const host = req.headers.host;
      const hostTag = NodeConfigService.getTenantConfigItem(
        context.tenantCode,
        'hostTag',
      ) as string;
      //  域名与服务商token要匹配，避免拿着aplus的token请求boat的网关
      if (process.env.NODE_ENV !== 'dev' && host.indexOf(hostTag) == -1) {
        logger.info(
          `请求开始【${req.method} - ${req.originalUrl}】 请求头:【${JSON.stringify(req.headers)}】请求体参数:【${JSON.stringify(req.body)}】 `,
        );
        sendExceptionToFeishu(new BadRequestException('非法请求'));
      }
      next();
    });
  }
  private async fixedTokenHandle(headerToken: string): Promise<UserContext> {
    let payload;
    try {
      const { fields: appInfo } = await this.clientSecretTable.get(headerToken);

      payload = {
        supplierCode: appInfo.服务商,
      };
    } catch (e) {
      sendExceptionToFeishu(e);
      payload = {};
    }
    return payload;
  }
  private async jwtTokenHandle(headerToken: string): Promise<UserContext> {
    let payload;
    try {
      payload = await this.jwtService.decode(headerToken);
    } catch (e) {
      sendExceptionToFeishu(e);
      payload = {};
    }
    return payload;
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
      payload = await this.jwtTokenHandle(headerToken);
    } else if (headerToken) {
      console.log(
        '[ headerToken ] >',
        request.headers.authorization,
        headerToken,
      );
      payload = await this.fixedTokenHandle(headerToken);
    }
    return payload || {};
  }
}
