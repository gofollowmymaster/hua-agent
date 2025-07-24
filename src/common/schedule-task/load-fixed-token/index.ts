import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import dayjs from 'dayjs';
import * as lark from '@larksuiteoapi/node-sdk';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import { FeishuAlertCard } from '@src/common/feishu/card/alert-card';

export type FeishuAuthType = Awaited<
  ReturnType<lark.Client['authen']['refreshAccessToken']['create']>
>['data'];

@Injectable()
export default class FixedTokenService {
  private readonly client: lark.Client;
  private readonly logger = new Logger(FixedTokenService.name);
  private readonly messagerHelper: FeishuMessageHelper;
  constructor(
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) protected cache: Cache,
  ) {
    const authClient = ClientFactory.create(FeishuApp.AilyAplusClient);
    this.client = authClient.client;
    this.messagerHelper = new FeishuMessageHelper(
      ClientFactory.create(FeishuApp.AlertClient, config),
    );
  }

  //每30分钟运行一次
  @Cron('0 */30 * * * *')
  async handleCron() {
    this.logger.debug(
      'FixedTokenService Called when the current is' +
        dayjs().format('YYYY-MM-DD HH:mm:ss'),
    );
    this.loadToken();
  }
  async loadToken() {
    const tokenInCached: FeishuAuthType = await this.cache.get(
      RedisKeys.FEISHU_FIXED_ACCESS_TOKEN,
    );
    console.log('[ cachedinfo ] >', tokenInCached);
    if (!tokenInCached?.refresh_token) {
      this.sendAlertMsg('token in cache is null');
      return;
    }

    const res = await this.client.authen.refreshAccessToken.create({
      data: {
        grant_type: 'refresh_token',
        refresh_token: tokenInCached.refresh_token,
      },
    });
    console.log('[ refreshAccessToken ] >', res);

    if (res.code !== 0) {
      this.sendAlertMsg(res.msg);
      return;
    }

    await this.cache.set(
      RedisKeys.FEISHU_FIXED_ACCESS_TOKEN,
      res.data,
      1000 * 60 * 60 * 24,
    );
  }
  sendAlertMsg(errorMessage: string) {
    const errorTime = dayjs();

    //构建消息内容
    const content = FeishuAlertCard.buildCardMsg({
      environment: process.env.NODE_ENV,
      title: '定时刷新Token异常报警',
      project: 'aplus-sql-server',
      color: 'red',
      errorMessage: `刷新Token异常；${errorMessage}`,
      errorTime: errorTime.format('YYYY-MM-DD HH:mm:ss'),
      linkUrl: `https://sls.console.aliyun.com/lognext/project/k8s-log-c893ce02efe464e778e67c48016348406/logsearch/elnkpro-prod-log?encode%3Dbase64%26queryString%3DIF9jb250YWluZXJfbmFtZV86IGFwbHVzLXNxbC1zZXJ2aWNlLXByb2Q%3D%26filterInfo%3DeyJmamNvZGUiOiIoKSIsImZxIjoiIn0%3D%26queryTimeType%3D99%26startTime%3D${errorTime.subtract(60, 's').valueOf() / 1000}%26endTime%3D${errorTime.add(60, 's').valueOf() / 1000}`,
    });
    this.messagerHelper.createInteractToGroup(
      content,
      this.config.get('DefaultAlertFeishuGroupId'),
    );
  }
}
