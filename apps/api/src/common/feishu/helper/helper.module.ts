import { DynamicModule, Module } from '@nestjs/common';
import FeishuMessageHelper from './message-helper';
import FeishuTableHelper from './table-helper';
import FeishuUserHelper from './feishu-user-helper';
import { FEISHU_CLIENT_ID } from './constants';
import FeishuClient from '../clients/client';
import FeishuDepartmentHelper from './feishu-department-helper';
import FeishuWikiHelper from './feishu-wiki-helper';
import FeishuAilyHelper from './feishu-aily-helper';
import FeishuDocxHelper from './feishu-docx-helper';
import FeishuFileHelper from './feishu-file-helper';
import FeishuAuthHelper from './feishu-auth-helper';
import FeishuOpenapiHelper from './feishu-openapi-helper';
import { HttpModule } from '@nestjs/axios';
import FeishuMediaHelper from './feishu-media-helper';

@Module({})
export class FeishuHelperModule {
  static forRoot(client: FeishuClient): DynamicModule {
    return {
      imports: [HttpModule],
      module: FeishuHelperModule,
      providers: [
        {
          provide: FEISHU_CLIENT_ID,
          useValue: client,
        },
        {
          provide: FeishuMessageHelper,
          useClass: FeishuMessageHelper,
        },
        {
          provide: FeishuTableHelper,
          useClass: FeishuTableHelper,
        },
        {
          provide: FeishuUserHelper,
          useClass: FeishuUserHelper,
        },
        {
          provide: FeishuDepartmentHelper,
          useClass: FeishuDepartmentHelper,
        },
        {
          provide: FeishuWikiHelper,
          useClass: FeishuWikiHelper,
        },
        {
          provide: FeishuAilyHelper,
          useClass: FeishuAilyHelper,
        },
        {
          provide: FeishuDocxHelper,
          useClass: FeishuDocxHelper,
        },
        {
          provide: FeishuFileHelper,
          useClass: FeishuFileHelper,
        },
        {
          provide: FeishuAuthHelper,
          useClass: FeishuAuthHelper,
        },
        {
          provide: FeishuOpenapiHelper,
          useClass: FeishuOpenapiHelper,
        },
        {
          provide: FeishuMediaHelper,
          useClass: FeishuMediaHelper,
        },
      ],
      exports: [
        FeishuMessageHelper,
        FeishuTableHelper,
        FeishuUserHelper,
        FeishuDepartmentHelper,
        FeishuWikiHelper,
        FeishuDocxHelper,
        FeishuAilyHelper,
        FeishuFileHelper,
        FeishuAuthHelper,
        FeishuOpenapiHelper,
        FeishuMediaHelper,
      ],
    };
  }
}
