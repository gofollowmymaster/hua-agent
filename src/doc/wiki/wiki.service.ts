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
import FeishuMediaHelper from '@src/common/feishu/helper/feishu-media-helper';
import WikiFeedbackTable from '../common/table/feedback';
import { Readable } from 'stream';
import { ReadStream } from 'fs';

@Injectable()
export class WikiService {
  private readonly redis: Redis;
  private readonly feishuWikiHelper: FeishuWikiHelper;
  private readonly feishuMediaHelper: FeishuMediaHelper;

  constructor(
    private readonly logger: LoggerService,
    private wikiDirectoryService: WikiDirectoryService,
    private readonly redisService: RedisService,
    private readonly wikiBlackListTable: WikiBlackListTable,
    private readonly wikiFeedbackTable: WikiFeedbackTable,
    protected readonly userContext: TenantContext,

    @InjectQueue('check-document') private checkDocumentQueue: Queue,
  ) {
    this.redis = redisService.getClient();
    this.feishuWikiHelper = new FeishuWikiHelper(
      ClientFactory.create(FeishuApp.AilyAplusClient),
      userContext,
      redisService,
    );

    //反馈功能统一使用一个Aplus的多为表格
    this.feishuMediaHelper = new FeishuMediaHelper(
      ClientFactory.create(FeishuApp.AlertClient),
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
      status: true,
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
    let file: {
      file_token?: string;
    };
    if (params.image?.buffer) {
      const fileStream = Readable.from(params.image.buffer) as ReadStream;
      console.log('[ ---------bitable_image----------- ] >');
      // 上传飞书
      file = await this.feishuMediaHelper.upload({
        file_name: params.image.originalname,
        file: fileStream,
        size: params.image.size,
        parent_node: this.wikiFeedbackTable.realAppToken,
        parent_type: 'bitable_image',
      });
    }

    const userInfo = this.userContext.user;
    params.type = JSON.parse(params.type);
    //保存
    await this.wikiFeedbackTable.create({
      问题描述: params.description,
      链接: params.feishuUrl,
      问题类别: params.type,
      截图: file ? [file] : [],
      'wiki-Token': params.node,
      服务商: userInfo.supplierName,
      供应商: userInfo.tenantName,
      用户: userInfo.username,
      服务商Code: userInfo.supplierCode,
      供应商Code: userInfo.tenantCode,
      用户Code: userInfo.userCode,
      环境: process.env.NODE_ENV,
    });
    return true;
  }
}
