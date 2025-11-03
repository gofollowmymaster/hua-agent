import FeishuClient from '../clients/client';
// import { ConfigService } from '@nestjs/config';
import { FEISHU_CLIENT_ID } from './constants';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { RedisService } from '@src/common/service/redis/redis.service';
import FeishuDataApiHelper from './feishu-data-api-helper';
import {
  DocumentBlockDescendantCreateData,
  DocumentBlockDescendantCreateParams,
  DocumentBlockDescendantCreatePath,
  DocumentBlockDescendantCreateReturn,
  DocxConvertData,
  DocxConvertReturn,
  DocxCreateReturn,
} from '../type/docx';

@Injectable({ scope: Scope.TRANSIENT })
class FeishuDocxHelper extends FeishuDataApiHelper {
  protected readonly useCache = false;
  protected readonly ttl = 60 * 60 * 24;
  constructor(
    // private readonly config: ConfigService,
    @Inject(FEISHU_CLIENT_ID) private readonly client: FeishuClient,
    protected redisService: RedisService,
  ) {
    super(redisService);
  }
  async createDocument(title: string): Promise<DocxCreateReturn> {
    return await this.requestWrapper(() =>
      this.client.client.docx.v1.document.create({
        data: {
          title,
        },
      }),
    );
  }
  async convertDocument(data: DocxConvertData): Promise<DocxConvertReturn> {
    return await this.requestWrapper(() =>
      this.client.client.docx.v1.document.convert({
        data,
      }),
    );
  }
  async createBlocks(
    data: DocumentBlockDescendantCreateData,
    path: DocumentBlockDescendantCreatePath,
  ): Promise<DocumentBlockDescendantCreateReturn> {
    console.log('[ data ] >', data, path);
    return await this.requestWrapper(
      () =>
        this.client.client.docx.v1.documentBlockDescendant.create({
          data,
          path,
        }),
      'createBlocks',
    );
  }
}

export default FeishuDocxHelper;
