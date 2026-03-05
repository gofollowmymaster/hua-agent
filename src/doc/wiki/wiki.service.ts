import * as lark from '@larksuiteoapi/node-sdk';

import { Injectable } from '@nestjs/common';
import { LoggerService } from '@src/common/service/logger/logger.service';

import { RedisKeys } from '@src/common/const/redis-key.enum';
import WikiDirectoryService from '../common/schedule/wiki-directory';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import {
  BlackListType,
  WikiBlackListDto,
  WikiBlackListResponseDto,
  WikiFeedbackDto,
  WikiSearchDto,
  WikiTreeDto,
} from './dto/wiki.dto';
import FeishuWikiHelper from '@src/common/feishu/helper/feishu-wiki-helper';
import { toSnakeCase } from '@src/common/utils/data';
import { FeishuAuthType } from '@src/common/feishu/type/auth';
import WikiBlackListTable from '../common/table/black-list';
import { BitTableSearchPayloadData } from '@src/common/feishu/type/bitable';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BitTableList } from '@src/type/global';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import { TenantContext } from '@src/common/service/context/tenant.context';

@Injectable()
export class WikiService {
  private readonly redis: Redis;
  private readonly feishuWikiHelper: FeishuWikiHelper;

  constructor(
    private readonly logger: LoggerService,
    private wikiDirectoryService: WikiDirectoryService,
    private readonly redisService: RedisService,
    private readonly wikiBlackListTable: WikiBlackListTable,
    protected readonly userContext: TenantContext,

    @InjectQueue('check-document') private checkDocumentQueue: Queue,
  ) {
    this.redis = redisService.getClient();
    this.feishuWikiHelper = new FeishuWikiHelper(
      ClientFactory.create(FeishuApp.AilyAplusClient),
      userContext,
      redisService,
    );
  }

  async tree({ spaceId, force = false }: WikiTreeDto) {
    const key = this.redisService.buildCacheKey(
      RedisKeys.WIKI_DIRECTORY,
      '{spaceId}',
      spaceId,
    );
    const data = (await this.redis.get(key)) || '';
    let tree;

    if (!data || force) {
      tree = await this.wikiDirectoryService.loadWikiNodeTree(spaceId);
    } else {
      tree = JSON.parse(data);
    }

    return {
      data: tree,
    };
  }
  async search(params: WikiSearchDto) {
    const usedKey = this.redisService.buildCacheKeyWithTemplates(
      RedisKeys.FEISHU_FIXED_ACCESS_TOKEN_USED,
      {
        module: 'aily',
      },
    );
    const userInfo: FeishuAuthType = await this.redis.hgetall(usedKey);
    const res = this.feishuWikiHelper.search(
      toSnakeCase(params),
      lark.withUserAccessToken(userInfo.access_token),
    );
    return res;
  }
  async batchSearch() {
    const { list: blackList } = await this.blacklist({
      type: [BlackListType.text],
      supplierCode: this.userContext.tenant,
    });

    await this.checkDocumentQueue.add('checkDocument', {
      blackList,
      tenantCode: this.userContext.tenant,
    });

    return {};
  }
  async blacklist(
    data: WikiBlackListDto,
  ): Promise<BitTableList<WikiBlackListResponseDto>> {
    const params: BitTableSearchPayloadData = {
      filter: {
        conjunction: 'and',
        conditions: [
          {
            field_name: '类型',
            operator: 'contains',
            value: data.type,
          },
          {
            field_name: '平台',
            operator: 'is',
            value: [data.supplierCode],
          },
        ],
      },
    };
    const res = this.wikiBlackListTable.searchTransformed(params);
    return res;
  }
  async feedback(params: WikiFeedbackDto): Promise<boolean> {
    // 处理用户反馈的知识库文档问题，例如记录到数据库或发送通知等
    this.logger.info(`Received feedback: ${JSON.stringify(params)}`);
    // 这里可以添加具体的处理逻辑，例如将反馈保存到数据库或发送邮件通知管理员等
    return true;
  }
}
