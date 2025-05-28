import { Injectable } from '@nestjs/common';
import { LogOperatorDto } from './dto/log-operator.dto';

// import feishuClient from '@src/common/feishu-robot/alert-client';
import { LoggerService } from '@src/common/service/logger/logger.service';

import { ConfigService } from '@nestjs/config';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import LogOperatorAdapter from './adapter/log-operator-adapter';
// import AilyLogOperatorTable from '@src/common/feishu/table/aily-log-operator-table';
import AilyLogOperatorTable from './adapter/aily-log-operator-table';

@Injectable()
export class LogOperatorService {
  // private messageHelper;
  private LogOperatorAdapter: LogOperatorAdapter;
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly messageHelper: FeishuMessageHelper,
    private readonly ailyLogOperatorTable: AilyLogOperatorTable,
  ) {}

  async add(params: LogOperatorDto) {
    console.log('[ params ] >', params);
    this.LogOperatorAdapter = new LogOperatorAdapter(params);
    // const list = await this.ailyLogOperatorTable.list();
    const record = this.LogOperatorAdapter.toTableData();
    // console.log('[ record ] >', '----------');

    await this.ailyLogOperatorTable.create(record);
    // return list;
  }
}
