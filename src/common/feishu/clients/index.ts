// import { nextTick } from 'process';
import AlertClient from './alert-client';
import { FeishuApp } from './enum';
import { ConfigService } from '@nestjs/config';
export const Clents = {
  AlertClient,
};
export class ClientFactory {
  static async create(clientName: FeishuApp, config: ConfigService) {
    // await nextTick();
    return new Clents[clientName](config);
  }
}
