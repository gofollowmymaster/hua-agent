import AiHelperClient from './aily-alert-client';
import AlertClient from './alert-client';
import XiaoAClient from './xiao-a-client';
import AilyAplusClient from './aplus-aily-client';
import FeishuClient from './client';
import AuthClient from './auth-client';
import XiaoLClient from './xiao-l-client';
import AplusNavClient from './nav-client';
import WikiClient from './wiki-client';
export const feishuAppClients = {
  AlertClient,
  XiaoAClient,
  AilyAplusClient,
  AuthClient,
  XiaoLClient,
  AiHelperClient,
  AplusNavClient,
  WikiClient,
};
export enum FeishuApp {
  AlertClient = 'AlertClient',
  AiHelperClient = 'AiHelperClient',
  XiaoAClient = 'XiaoAClient',
  XiaoLClient = 'XiaoLClient',
  AilyAplusClient = 'AilyAplusClient',
  AuthClient = 'AuthClient',
  AplusNavClient = 'AplusNavClient',
  WikiClient = 'WikiClient',
}

export type FeishuAppClientsType = keyof typeof feishuAppClients;
type ClientContainer = Record<FeishuAppClientsType, FeishuClient>;

/**
 * @description: 飞书客户端工厂类
 */
export class ClientFactory {
  private static clientContainer: Partial<ClientContainer> = {};

  static create(clientName: FeishuAppClientsType) {
    if (!this.clientContainer[clientName]) {
      this.clientContainer[clientName] = new feishuAppClients[clientName]();
    }
    return this.clientContainer[clientName];
  }
}
