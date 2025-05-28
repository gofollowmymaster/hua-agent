import { LogOperatorTableDto } from './log-operator-table.dto';
import { LogOperatorDto } from '../dto/log-operator.dto';

export default class SentryApiAlertAdapter {
  private data: LogOperatorDto;
  constructor(data: LogOperatorDto) {
    this.data = data;
  }

  toTableData(): LogOperatorTableDto {
    return {
      ID: this.data.messageId,
      操作用户: JSON.stringify(this.data.user),
      // 备注?: string;
    };
  }
}
