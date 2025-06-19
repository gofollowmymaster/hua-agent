import { Injectable } from '@nestjs/common';
import { WikiDto } from './dto/wiki.dto';
import * as lark from '@larksuiteoapi/node-sdk';
import { LoggerService } from '@src/common/service/logger/logger.service';

import { ConfigService } from '@nestjs/config';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';

@Injectable()
export class WikiService {
  // private messageHelper;
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {}

  async tree(params: WikiDto) {
    const xiaoAclient = ClientFactory.create(FeishuApp.XiaoAClient);
    const client = xiaoAclient.client;

    const nodeApi = async (nodeToken?: string) => {
      const node = await client.wiki.v2.spaceNode.list({
        path: {
          space_id: params.spaceId,
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
    };

    const items = await nodeApi();

    const request = async (items: any[]) => {
      const requestList: Promise<void>[] = [];
      for (const index in items) {
        const item = items[index];
        if (item.hasChild) {
          const api = async () => {
            const children = await nodeApi(item.nodeToken);
            item.children = children;
            await request(children);
          };
          requestList.push(api());
        }
      }
      await Promise.all(requestList);
    };
    await request(items);

    return {
      data: items,
    };
  }
}
