// import { nextTick } from 'process';
import AlertClient from './alert-client';
import { FeishuApp } from './enum';
import { ConfigService } from '@nestjs/config';
export const Clents = {
  AlertClient,
};
export class ClientFactory {
  private static clientContainer = {};
  //   constructor() {
  //     this.clientContainer = {};
  //   }
  static async create(clientName: FeishuApp, config: ConfigService) {
    // await nextTick();
    if (!this.clientContainer[clientName]) {
      this.clientContainer[clientName] = new Clents[clientName](config);
    }
    return this.clientContainer[clientName];
  }
}
