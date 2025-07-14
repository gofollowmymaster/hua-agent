import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import dayjs from 'dayjs';
import * as lark from '@larksuiteoapi/node-sdk';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { FeishuApiException } from '@src/common/exception/feishu-api-exception';

export type FeishuAuthType = Awaited<
  ReturnType<lark.Client['authen']['refreshAccessToken']['create']>
>['data'];
// type AuthType = ReturnType<lark.Client.authen.refreshAccessToken.create>;
// import
const tokenInfo: Record<string, FeishuAuthType> = {
  dev: {
    access_token: 'u-4aG36mI09foHctUf_R2N5bk02CrMhkGVNgw00hcy2bUm',
    avatar_big:
      'https://s1-imfile.feishucdn.com/static-resource/v1/v3_009h_96cf49af-d754-4cde-bad1-e25a589f946g~?image_size=640x640&cut_type=&quality=&format=image&sticker_format=.webp',
    avatar_middle:
      'https://s3-imfile.feishucdn.com/static-resource/v1/v3_009h_96cf49af-d754-4cde-bad1-e25a589f946g~?image_size=240x240&cut_type=&quality=&format=image&sticker_format=.webp',
    avatar_thumb:
      'https://s1-imfile.feishucdn.com/static-resource/v1/v3_009h_96cf49af-d754-4cde-bad1-e25a589f946g~?image_size=72x72&cut_type=&quality=&format=image&sticker_format=.webp',
    avatar_url:
      'https://s1-imfile.feishucdn.com/static-resource/v1/v3_009h_96cf49af-d754-4cde-bad1-e25a589f946g~?image_size=72x72&cut_type=&quality=&format=image&sticker_format=.webp',
    en_name: 'Ahua',
    enterprise_email: 'ahua@aplnk.com',
    expires_in: 6899,
    name: 'Ahua',
    open_id: 'ou_d59766eb1f195bb3ec11ad321e7a6e0a',
    refresh_expires_in: 2591699,
    refresh_token: 'ur-6nljOdUYl5A9ezzD2ws51Ek02CPMhkENN0w0kgcy2aEm',
    sid: 'AAAAAAAAAABobHakR4AAEw==',
    tenant_key: '1694e7f6f01d9758',
    token_type: 'Bearer',
    union_id: 'on_5a750bac73c4740ee4c35636796bcec7',
    user_id: '762a5468',
  },
};
@Injectable()
export default class FixedTokenService {
  private readonly client: lark.Client;
  private readonly spaceId: string;
  private readonly logger = new Logger(FixedTokenService.name);

  constructor(
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) protected cache: Cache,
  ) {
    const authClient = ClientFactory.create(FeishuApp.AuthClient);
    this.client = authClient.client;
  }

  //每30分钟运行一次
  @Cron('0 * * * * *')
  async handleCron() {
    this.logger.debug(
      'FixedTokenService Called when the current is' +
        dayjs().format('YYYY-MM-DD HH:mm:ss'),
    );
    this.loadToken();
  }
  async loadToken() {
    const cachedinfo: FeishuAuthType = await this.cache.get(
      RedisKeys.FEISHU_FIXED_ACCESS_TOKEN,
    );
    const token = cachedinfo || tokenInfo.dev;
    const res = await this.client.authen.refreshAccessToken.create({
      data: {
        grant_type: 'refresh_token',
        refresh_token: token.refresh_token,
      },
    });
    if (res.code !== 0) {
      throw new FeishuApiException();
    }

    console.log('[ refreshAccessToken ] >', res);

    await this.cache.set(RedisKeys.FEISHU_FIXED_ACCESS_TOKEN, res.data);

    console.log('[ cachedinfo ] >', cachedinfo.access_token);
  }
}
