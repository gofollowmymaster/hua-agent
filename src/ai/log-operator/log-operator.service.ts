import { Injectable } from '@nestjs/common';
import { LogOperatorDto } from './dto/log-operator.dto';

import { LoggerService } from '@src/common/service/logger/logger.service';

import LogOperatorAdapter from './adapter/log-operator-adapter';
import AilyLogOperatorTable from './adapter/aily-log-operator-table';

@Injectable()
export class LogOperatorService {
  private LogOperatorAdapter: LogOperatorAdapter;
  constructor(
    private readonly logger: LoggerService,
    private readonly ailyLogOperatorTable: AilyLogOperatorTable,
  ) {}

  async add(params: LogOperatorDto) {
    this.LogOperatorAdapter = new LogOperatorAdapter(params);
    const record = this.LogOperatorAdapter.toTableData();

    await this.ailyLogOperatorTable.create(record);
  }
}
