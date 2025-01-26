import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { ConfigService } from '@nestjs/config';

@Injectable()
class FeishuAlertClient extends FeishuClient {
  private readonly instance;
  // constructor(private readonly config: ConfigService) {
  //   const AlertAppId = config.get('AlertAppId');
  //   const AlertAppSecret = config.get('AlertAppSecret');
  //   console.log('[ AlertAppId ] >', AlertAppId)
  //   console.log('[ AlertAppSecret ] >', AlertAppSecret)
  //   super(AlertAppId, AlertAppSecret);
  // }
  constructor(private config?: ConfigService) {
    // const AlertAppId1 = config.get('AlertAppId');
    // const AlertAppSecret1 = config.get('AlertAppSecret');
    // console.log('[ AlertAppId1 ] >', AlertAppId1);
    // console.log('[ AlertAppSecret1 ] >', AlertAppSecret1);

    // config = new Map([
    //   ['AlertAppId', 'cli_a7c7e073b579500e'],
    //   ['AlertAppSecret', 'M8jpmdjcb8wvAxjU2Wlk2cULx0Cobeap'],
    // ]);
    const AlertAppId = config.get('AlertAppId');
    const AlertAppSecret = config.get('AlertAppSecret');
    console.log('[ AlertAppId ] >', AlertAppId);
    console.log('[ AlertAppSecret ] >', AlertAppSecret);
    super('cli_a7c7e073b579500e', 'M8jpmdjcb8wvAxjU2Wlk2cULx0Cobeap');
    // if (this.instance) return this.instance;
  }
}

// export const alertClient = new FeishuAlertClient(
//   new Map([
//     ['AlertAppId', 'cli_a7c7e073b579500e'],
//     ['AlertAppSecret', 'M8jpmdjcb8wvAxjU2Wlk2cULx0Cobeap'],
//   ]),
// );

export default FeishuAlertClient;
