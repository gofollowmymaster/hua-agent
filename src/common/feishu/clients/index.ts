// import { nextTick } from 'process';
import AlertClient from './alert-client';
import XiaoAClient from './xiao-a-client';
import AilyAplusClient from './aplus-aily-client';
import { ConfigService } from '@nestjs/config';
import FeishuClient from './client';
import AuthClient from './auth-client';
export const feishuAppClents = {
  AlertClient,
  XiaoAClient,
  AilyAplusClient,
  AuthClient,
};
export enum FeishuApp {
  AlertClient = 'AlertClient',
  XiaoAClient = 'XiaoAClient',
  AilyAplusClient = 'AilyAplusClient',
  AuthClient = 'AuthClient',
}

export type FeishuAppClentsType = keyof typeof feishuAppClents;
type ClientContainer = Record<FeishuAppClentsType, FeishuClient>;

/**
 * @description: 飞书客户端工厂类
 */
export class ClientFactory {
  private static clientContainer: Partial<ClientContainer> = {};

  static create(clientName: FeishuAppClentsType, config?: ConfigService) {
    // await nextTick();
    if (!this.clientContainer[clientName]) {
      this.clientContainer[clientName] = new feishuAppClents[clientName](
        config,
      );
    }
    return this.clientContainer[clientName];
  }
}
