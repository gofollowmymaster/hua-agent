import { Injectable } from '@nestjs/common';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { FeishuPushDto } from './dto/sync';
import FeishuDocxHelper from '@src/common/feishu/hepler/feishu-docx-helper';

@Injectable()
export class SyncService {
  protected readonly redis: Redis;
  constructor(
    protected redisService: RedisService,
    protected FeishuDocxHelper: FeishuDocxHelper,
  ) {
    this.redis = redisService.getClient();
  }

  async pushDocument(params: FeishuPushDto): Promise<any> {
    //1. 转换文档内容
    const documconstent = await this.FeishuDocxHelper.convertDocument({
      content_type: 'markdown',
      content: params.content,
    });
    const key = RedisKeys.PUSH_FEISHU_DOC_CACHE.replace('{tag}', params.tag);

    //2. 获取文档id ,如果没有创建文档
    let documentInfo = await this.redis.hgetall(key);
    let documentId = documentInfo?.documentId;

    if (!documentId) {
      const { document } = await this.FeishuDocxHelper.createDocument(
        params.title,
      );
      documentId = document.document_id;

      return {
        data: {
          children_id: documconstent.first_level_block_ids,
          descendants: documconstent.blocks,
        },
        path: {
          document_id: documentId,
          block_id: documentId,
        },
      };
      //3. 上传文档内容到飞书知识库
      const res = await this.FeishuDocxHelper.createBlocks(
        {
          children_id: documconstent.first_level_block_ids,
          descendants: documconstent.blocks,
        },
        {
          document_id: documentId,
          block_id: documentId,
        },
      );
      await this.redis.hmset(key, {
        ...document,
        blocks: res,
      });
      return res;
    } else {
      //3. 更新文档内容到飞书知识库
      // const res = await this.FeishuDocxHelper.createBlocks();
    }
  }
}
