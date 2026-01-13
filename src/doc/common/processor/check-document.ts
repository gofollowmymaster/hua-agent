import * as lark from '@larksuiteoapi/node-sdk';

import { OnWorkerEvent, Processor } from '@nestjs/bullmq';

import { RedisKeys } from '@src/common/const/redis-key.enum';
import FeishuDocxHelper from '@src/common/feishu/helper/feishu-docx-helper';
import FeishuFileHelper from '@src/common/feishu/helper/feishu-file-helper';
import FeishuWikiHelper from '@src/common/feishu/helper/feishu-wiki-helper';
import { RedisService } from '@src/common/service/redis/redis.service';
import { wait } from '@src/common/utils/job';
import { Job } from 'bullmq';
import Redis from 'ioredis';
import { FeishuAuthType } from '@src/common/feishu/type/auth';
import { WikiBlackListResponseDto } from '@src/doc/wiki/dto/wiki.dto';
import { NodeConfigService } from '@src/config/node-config.service';
import { tenantCodeMap } from '@src/config/tenant';
import BaseProcessor from '@src/common/base/base.processor';
import { TenantContext } from '@src/common/service/context/tenant.context';
import FeishuMessageHelper from '@src/common/feishu/helper/message-helper';
import TipCard from '@src/common/feishu/card/tip-card';
type CheckDocumentParams = {
  blackList: WikiBlackListResponseDto[];
  tenantCode: tenantCodeMap;
};

@Processor('check-document')
export class CheckDocumentProcessor extends BaseProcessor {
  protected readonly redis: Redis;
  constructor(
    protected redisService: RedisService,
    protected readonly tenantContext: TenantContext,
    protected feishuMessageHelper: FeishuMessageHelper,
    protected feishuWikiHelper: FeishuWikiHelper,
    protected feishuFileHelper: FeishuFileHelper,
  ) {
    super(tenantContext);
    this.redis = redisService.getClient();
  }

  async handle(data: CheckDocumentParams): Promise<any> {
    const usedKey = this.redisService.buildCacheKeyWithTemplates(
      RedisKeys.FEISHU_FIXED_ACCESS_TOKEN_USED,
      {
        module: 'aily',
      },
    );
    const userInfo: FeishuAuthType = await this.redis.hgetall(usedKey);
    if (!userInfo.access_token) {
    }
    const { blackList, tenantCode } = data;
    const spaceId = NodeConfigService.getTenantConfigItem(
      tenantCode,
      'FeishuWikiSpaceIds',
    ) as string;
    for (const blackItem of blackList) {
      try {
        const res = await this.feishuWikiHelper.search(
          {
            query: blackItem['关键字'],
            space_id: spaceId[0],
          },
          lark.withUserAccessToken(userInfo.access_token),
        );
        console.log('[ res ] >', blackItem['关键字'], res);
        if (res.items.length > 0) {
          const docs = res.items.reduce((prev, next) => {
            prev = prev + `[${next.title}](${next.url})，`;
            return prev;
          }, '');
          const content = TipCard.buildCardMsg({
            title: '知识库黑名单检测异常通知',
            bgColor: 'red',
            content: `服务商:<text_tag color='blue'>${tenantCode}</text_tag>的如下文档：${docs}存在黑名单中的关键字**${blackItem['关键字']}**，请及时处理！`,
          });
          this.feishuMessageHelper.createInteractToGroup(
            content,
            NodeConfigService.getOrThrow('WikiBlackListCheckoutGroupId'),
          );
        }
      } catch (error) {
        throw new Error(
          '检查文档失败：关键字' + blackItem['关键字'] + ' ' + error.message,
        );
      }

      await wait(1000);
    }
  }
}
