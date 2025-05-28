// import { nextTick } from 'process';
import AlertClient from './alert-client';
import XiaoAClient from './xiao-a-client';
import { ConfigService } from '@nestjs/config';
export const feishuAppClents = {
  AlertClient,
  XiaoAClient,
};
export enum FeishuApp {
  AlertClient = 'AlertClient',
  XiaoAClient = 'XiaoAClient',
}

export type feishuAppClentsType = keyof typeof feishuAppClents;

/**
 * @description: 飞书客户端工厂类
 */
export class ClientFactory {
  private static clientContainer = {};

  static create(clientName: feishuAppClentsType, config?: ConfigService) {
    // await nextTick();
    if (!this.clientContainer[clientName]) {
      this.clientContainer[clientName] = new feishuAppClents[clientName](
        config,
      );
    }
    return this.clientContainer[clientName];
  }
}
