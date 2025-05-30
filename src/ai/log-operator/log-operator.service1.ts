import { Injectable, OnModuleInit } from '@nestjs/common';
import { LogOperatorDto } from './dto/log-operator.dto';

import { LoggerService } from '@src/common/service/logger/logger.service';

import { ConfigService } from '@nestjs/config';
import LogOperatorAdapter from './adapter/log-operator-adapter';
import AilyLogOperatorTable from './adapter/aily-log-operator-table';

@Injectable()
export class LogOperatorService1 implements OnModuleInit {
  // private messageHelper;
  private LogOperatorAdapter: LogOperatorAdapter;
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly ailyLogOperatorTable: AilyLogOperatorTable,
  ) {}

  async add(params: LogOperatorDto) {
    this.LogOperatorAdapter = new LogOperatorAdapter(params);
    const record = this.LogOperatorAdapter.toTableData();

    await this.ailyLogOperatorTable.create(record);
  }
  onModuleInit() {
    console.log('[ LogOperatorService1 OnModuleInit ] >');
  }
}
