import FeishuClient from '../clients/client';

import { FEISHU_CLIENT_ID } from './constants';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { RedisService } from '@src/common/service/redis/redis.service';
import FeishuDataApiHelper from './feishu-data-api-helper';
import {
  WikiDirectoryListReturn,
  WikiMoveDocsToWikiParams,
  WikiMoveDocsToWikiReturn,
  WikiSearchData,
  WikiSearchOptions,
  WikiSearchPageParams,
  WikiSearchReturn,
  WikiTreeItem,
} from '../type/wiki';
import { createHash } from 'crypto';
import { TenantContext } from '@src/common/service/context/tenant.context';

@Injectable({ scope: Scope.TRANSIENT })
class FeishuWikiHelper extends FeishuDataApiHelper {
  protected readonly useCache = true;
  protected readonly ttl = 60 * 60 * 24;
  constructor(
    @Inject(FEISHU_CLIENT_ID) protected readonly feishuClient: FeishuClient,
    protected readonly userContext: TenantContext,
    protected redisService: RedisService,
  ) {
    super(redisService);
  }
  async moveDocumentToSpace(
    data: WikiMoveDocsToWikiParams,
    spaceId: string,
  ): Promise<WikiMoveDocsToWikiReturn> {
    return await this.requestWrapper(() =>
      this.client.wiki.v2.spaceNode.moveDocsToWiki({
        data,
        path: {
          space_id: spaceId,
        },
      }),
    );
  }
  async search(
    data: WikiSearchData,
    options: WikiSearchOptions,
    pageParams: WikiSearchPageParams = {},
    useCache = false,
  ): Promise<WikiSearchReturn> {
    return await this.readWrapper(
      async () =>
        await this.client.wiki.v1.node.search(
          {
            data,
            params: {
              page_size: 20,
              page_token: '',
              ...pageParams,
            },
          },
          options,
        ),
      useCache,
      `wiki-search:${JSON.stringify(data)}`,
    );
  }
  async list(
    spaceId: string,
    nodeToken?: string,
    useCache = false,
  ): Promise<WikiDirectoryListReturn> {
    return await this.readWrapper(
      async () =>
        await this.client.wiki.v2.spaceNode.list({
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

      console.log('[ updateTime ] >', item);
      return {
        key: item.node_token,
        hasChild: item.has_child,
        nodeToken: item.node_token,
        parentNodeToken: item.parent_node_token,
        updateTime: item.obj_edit_time,
        objType: item.obj_type,
        title: item.title,
        uniqueId,
      };
    });
  }
}

export default FeishuWikiHelper;
