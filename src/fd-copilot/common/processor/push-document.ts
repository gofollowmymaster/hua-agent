import { Processor, Process } from '@nestjs/bull';

import { RedisKeys } from '@src/common/const/redis-key.enum';
import FeishuDocxHelper from '@src/common/feishu/hepler/feishu-docx-helper';
import FeishuFileHelper from '@src/common/feishu/hepler/feishu-file-helper';
import FeishuWikiHelper from '@src/common/feishu/hepler/feishu-wiki-helper';
import { RedisService } from '@src/common/service/redis/redis.service';
import { parentWikiToken, spaceId } from '@src/fd-copilot/sync/config';
import { FeishuPushDto } from '@src/fd-copilot/sync/dto/sync';
import { wait } from '@utils/job';
import { Job } from 'bull';
import { createHash } from 'crypto';
import Redis from 'ioredis';

@Processor('document')
export class SyncDocumentProcessor {
  protected readonly redis: Redis;
  constructor(
    protected redisService: RedisService,
    protected FeishuDocxHelper: FeishuDocxHelper,
    protected feishuWikiHelper: FeishuWikiHelper,
    protected feishuFileHelper: FeishuFileHelper,
  ) {
    this.redis = redisService.getClient();
  }
  async contenthandler(params: FeishuPushDto) {
    const documconstent = await this.FeishuDocxHelper.convertDocument({
      content_type: 'markdown',
      content: params.content,
    });
    documconstent.blocks = documconstent.blocks.map((block) => {
      if (block.block_type === 31) {
        delete block.table.property.merge_info;
      }
      return block;
    });

    return documconstent;
  }

  async createDocument(params: FeishuPushDto) {
    let documentId = '';
    try {
      const { document } = await this.FeishuDocxHelper.createDocument(
        params.title,
      );
      documentId = document.document_id;
      //移动文档到指定知识库
      await this.feishuWikiHelper.moveDocumentToSpace(
        {
          parent_wiki_token: parentWikiToken[params.module],
          obj_token: documentId,
          obj_type: 'docx',
        },
        spaceId,
      );
      return documentId;
    } catch (error) {
      this.feishuFileHelper.deleteFile(
        { type: 'docx' },
        {
          file_token: documentId,
        },
      );
      throw new Error('创建文档失败：' + documentId + ' ' + error.message);
    }
  }

  @Process('syncDocument') // 处理名为 'sync' 的任务
  async syncDocument(job: Job<FeishuPushDto>): Promise<any> {
    const params = job.data;
    const key = RedisKeys.PUSH_FEISHU_DOC_CACHE.replace('{tag}', params.tag);

    //1. 获取文档id ,如果没有创建文档,如果有删除节点
    let { documentId, hash, blocksNum } = await this.redis.hgetall(key);

    const contentHash = createHash('md5').update(params.content).digest('hex');
    if (contentHash == hash) {
      throw new Error('文档内容未改变');
    }
    if (!documentId) {
      documentId = await this.createDocument(params);
    } else {
      //删除节点
      await this.FeishuDocxHelper.deleteBlock(
        { start_index: 0, end_index: parseInt(blocksNum) },
        { document_id: documentId, block_id: documentId },
      );
    }
    //2. 转换文档内容
    const documconstent = await this.contenthandler(params);
    //3. 上传文档内容
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
      documentId,
      blocksNum: documconstent.first_level_block_ids.length,
      hash: contentHash,
    });
    await wait(1000);
    return res;
  }
}
