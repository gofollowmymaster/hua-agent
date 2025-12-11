import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';

import { RedisKeys } from '@src/common/const/redis-key.enum';
import FeishuDocxHelper from '@src/common/feishu/helper/feishu-docx-helper';
import FeishuFileHelper from '@src/common/feishu/helper/feishu-file-helper';
import FeishuWikiHelper from '@src/common/feishu/helper/feishu-wiki-helper';
import { RedisService } from '@src/common/service/redis/redis.service';
import { getParentWikiToken, spaceId } from '@src/fd-copilot/sync/config';
import { FeishuPushDto } from '@src/fd-copilot/sync/dto/sync';
import { wait } from '@src/common/utils/job';
import { Job } from 'bullmq';
import { createHash } from 'crypto';
import Redis from 'ioredis';

@Processor('sync-document')
export class SyncDocumentProcessor extends WorkerHost {
  protected readonly redis: Redis;
  constructor(
    protected redisService: RedisService,
    protected feishuDocxHelper: FeishuDocxHelper,
    protected feishuWikiHelper: FeishuWikiHelper,
    protected feishuFileHelper: FeishuFileHelper,
  ) {
    super();
    this.redis = redisService.getClient();
  }
  async contenthandler(params: FeishuPushDto) {
    const documconstent = await this.feishuDocxHelper.convertDocument({
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
      const { document } = await this.feishuDocxHelper.createDocument(
        params.title,
      );
      documentId = document.document_id;
      //移动文档到指定知识库
      await this.feishuWikiHelper.moveDocumentToSpace(
        {
          parent_wiki_token: getParentWikiToken(params.module),
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

  async process(job: Job<FeishuPushDto>): Promise<any> {
    const params = job.data;
    const key = RedisKeys.PUSH_FEISHU_DOC_CACHE.replace(
      '{tag}',
      params.module + ':' + params.tag,
    );

    //1. 获取文档id ,如果没有创建文档,如果有删除节点
    // eslint-disable-next-line prefer-const
    let { documentId, hash, blocksNum } = await this.redis.hgetall(key);

    const contentHash = createHash('md5').update(params.content).digest('hex');
    if (contentHash == hash) {
      throw new Error('文档内容未改变');
    }
    try {
      if (!documentId) {
        documentId = await this.createDocument(params);
      } else {
        //删除节点
        await this.feishuDocxHelper.deleteBlock(
          { start_index: 0, end_index: parseInt(blocksNum) },
          { document_id: documentId, block_id: documentId },
        );
      }
      //2. 转换文档内容
      const documconstent = await this.contenthandler(params);
      //3. 上传文档内容
      await this.feishuDocxHelper.createBlocks(
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
    } catch (error) {
      throw new Error('同步文档失败：' + documentId + ' ' + error.message);
    }
    await wait(1000);
  }

  @OnWorkerEvent('active')
  onJobActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}`,
    );
  }
  @OnWorkerEvent('completed')
  onJobCompleted(job: Job) {
    console.log(`Job ${job.id} completed with result:`, job.returnvalue);
  }

  @OnWorkerEvent('failed')
  onJobFailed(job: Job, error: Error) {
    console.error(`Job ${job.id} failed with error:`, error.message);
  }
}
