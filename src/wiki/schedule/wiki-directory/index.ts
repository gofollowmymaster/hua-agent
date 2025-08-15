import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import * as lark from '@larksuiteoapi/node-sdk';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisKeys } from '@src/common/const/redis-key.enum';

// import

@Injectable()
export default class WikiDirectoryService {
  private readonly client: lark.Client;
  private readonly spaceId: string;
  private readonly logger = new Logger(WikiDirectoryService.name);

  constructor(
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) protected cache: Cache,
  ) {
    const xiaoAclient = ClientFactory.create(FeishuApp.XiaoAClient);
    this.client = xiaoAclient.client;
    this.spaceId = this.config.getOrThrow('FeishuAplusWikiSpaceId');
  }

  @Cron('0 0 8-22 * * *')
  async handleCron() {
    this.logger.debug('WikiDirectoryService Called ');
    this.loadWikiNodeTree();
  }
  async loadWikiNodeTree() {
    const rootNodes = await this.loadWikiNode();

    await this.loadDirectory(rootNodes);

    const key = RedisKeys.WIKI_DIRECTORY.replace('{spaceId}', this.spaceId);
    this.cache.set(key, rootNodes, 0);
    return rootNodes;
  }
  /**
   * 递归加载wiki节点tree
   * @param items
   */
  async loadDirectory(items: any[]) {
    const requestList: Promise<void>[] = [];
    for (const index in items) {
      const item = items[index];
      if (item.hasChild) {
        const api = async () => {
          const children = await this.loadWikiNode(item.nodeToken);
          item.children = children;
          await this.loadDirectory(children);
        };
        requestList.push(api());
      }
    }
    await Promise.all(requestList);
  }

  async loadWikiNode(nodeToken?: string) {
    const node = await this.client.wiki.v2.spaceNode.list({
      path: {
        space_id: this.spaceId,
      },
      params: {
        parent_node_token: nodeToken,
      },
    });
    return node.data.items.map((item) => {
      return {
        key: item.node_token,
        hasChild: item.has_child,
        nodeToken: item.node_token,
        parentNodeToken: item.parent_node_token,
        objType: item.obj_type,
        title: item.title,
      };
    });
  }
}
