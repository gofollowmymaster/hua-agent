// import { nextTick } from 'process';
import AlertClient from './alert-client';
import XiaoAClient from './xiao-a-client';
import { FeishuApp } from './enum';
import { ConfigService } from '@nestjs/config';
export const Clents = {
  AlertClient,
  XiaoAClient,
};
/**
 * @description: 飞书客户端工厂类
 */
export class ClientFactory {
  private static clientContainer = {};

  static create(clientName: FeishuApp, config?: ConfigService) {
    // await nextTick();
    if (!this.clientContainer[clientName]) {
      this.clientContainer[clientName] = new Clents[clientName](config);
    }
    return this.clientContainer[clientName];
  }
}
