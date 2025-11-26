import AiHeplerClient from './aily-alert-client';
import AlertClient from './alert-client';
import XiaoAClient from './xiao-a-client';
import AilyAplusClient from './aplus-aily-client';
import FeishuClient from './client';
import AuthClient from './auth-client';
export const feishuAppClents = {
  AlertClient,
  XiaoAClient,
  AilyAplusClient,
  AuthClient,
  AiHeplerClient,
};
export enum FeishuApp {
  AlertClient = 'AlertClient',
  AiHeplerClient = 'AiHeplerClient',
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

  static create(clientName: FeishuAppClentsType) {
    if (!this.clientContainer[clientName]) {
      this.clientContainer[clientName] = new feishuAppClents[clientName]();
    }
    return this.clientContainer[clientName];
  }
}
