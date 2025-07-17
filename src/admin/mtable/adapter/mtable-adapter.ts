import { LogOperatorTableDto } from './mtable-table';
import { MtableDto } from '../dto/mtable.dto';

export default class LogOperatorAdapter {
  private data: MtableDto;
  constructor(data: MtableDto) {
    this.data = data;
  }

  toTableData(): LogOperatorTableDto {
    return {
      // ID: this.data.messageId,
      // 操作用户: this.data.userName,
      // 供应商: this.data.tenantName,
      // 备注?: string;
    };
  }
}
