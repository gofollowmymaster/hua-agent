import { LogOperatorTableDto } from './log-operator-table.dto';
import { Environment, LogOperatorDto } from '../dto/log-operator.dto';

export default class LogOperatorAdapter {
  private data: LogOperatorDto;
  constructor(data: LogOperatorDto) {
    this.data = data;
  }

  toTableData(): LogOperatorTableDto {
    return {
      ID: this.data.messageId,
      操作用户: this.data.userName,
      供应商: this.data.tenantName,
      环境: this.data.env || (process.env.NODE_ENV as Environment),
      // 备注?: string;
    };
  }
}
