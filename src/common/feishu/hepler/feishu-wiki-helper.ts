import FeishuClient from '../clients/client';
// import { ConfigService } from '@nestjs/config';
import { FEISHU_CLIENT_ID } from './constants';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { RedisService } from '@src/common/service/redis/redis.service';
import FeishuDataApiHelper from './feishu-data-api-helper';
import { WikiDirectoryListReturn, WikiTreeItem } from '../type/wiki';
import { createHash } from 'crypto';

@Injectable({ scope: Scope.TRANSIENT })
class FeishuWikiHelper extends FeishuDataApiHelper {
  protected readonly useCache = true;
  protected readonly ttl = 60 * 60 * 24;
  constructor(
    // private readonly config: ConfigService,
    @Inject(FEISHU_CLIENT_ID) private readonly client: FeishuClient,
    protected redisService: RedisService,
  ) {
    super(redisService);
  }
  async createDocument(title: string) {
    return await this.requestWrapper(() =>
      this.client.client.docx.v1.document.create({
        data: {
          title,
        },
      }),
    );
  }
  async convertDocument(content: string) {
    return await this.requestWrapper(() =>
      this.client.client.docx.v1.document.convert({
        data: {
          content_type: 'markdown',
          content,
        },
      }),
    );
  }
  async list(
    spaceId: string,
    nodeToken?: string,
    useCache = false,
  ): Promise<WikiDirectoryListReturn> {
    return await this.readWrapper(
      async () =>
        await this.client.client.wiki.v2.spaceNode.list({
          path: {
            space_id: spaceId,
          },
          params: {
            parent_node_token: nodeToken,
          },
        }),
      useCache,
      `wiki-list:${spaceId}:${nodeToken}`,
    );
  }

  async loadWikiTree(spaceId: string) {
    const rootNodes = await this.loadWikiNode(spaceId);
    await this.loadDirectory(spaceId, rootNodes);

    return rootNodes;
  }
  /**
   * 递归加载wiki节点tree
   * @param items
   */
  async loadDirectory(spaceId, items: WikiTreeItem[]) {
    const requestList: Promise<void>[] = [];
    for (const index in items) {
      const item = items[index];
      if (item.hasChild) {
        const api = async () => {
          const children = await this.loadWikiNode(spaceId, item);
          item.children = children;
          await this.loadDirectory(spaceId, children);
        };
        requestList.push(api());
      }
    }
    await Promise.all(requestList);
  }

  async loadWikiNode(spaceId: string, parentNode?: WikiTreeItem) {
    const node = await this.list(spaceId, parentNode?.nodeToken);
    return node.items.map((item) => {
      const str = (parentNode?.title ?? '') + ':' + item.title;
      const uniqueId = createHash('md5').update(str).digest('hex');
      return {
        key: item.node_token,
        hasChild: item.has_child,
        nodeToken: item.node_token,
        parentNodeToken: item.parent_node_token,
        objType: item.obj_type,
        title: item.title,
        uniqueId,
      };
    });
  }
}

export default FeishuWikiHelper;
