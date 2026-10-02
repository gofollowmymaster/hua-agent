import AlertClient from './alert-client';
import FeishuClient from './client';
export const feishuAppClients = {
  AlertClient,
};
export enum FeishuApp {
  AlertClient = 'AlertClient',
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
