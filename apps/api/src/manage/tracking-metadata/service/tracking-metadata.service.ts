import { Injectable } from '@nestjs/common';
import { TrackingMetadataDto } from '../dto/tracking-metadata.dto';
import TrackingMetadataTable from '@src/manage/common/table/tracking-metadata.table';
import { BitTableFilter } from '@src/common/feishu/type/bitable';

@Injectable()
export class TrackingMetadataService {
  constructor(private readonly table: TrackingMetadataTable) {}

  async search(
    businessLine?: string,
    eventType?: string,
  ): Promise<TrackingMetadataDto[]> {
    const filter: BitTableFilter = {
      conjunction: 'and',
      conditions: [
        {
          field_name: '业务线',
          operator: 'contains',
          value: [businessLine],
        },
        {
          field_name: '事件类型',
          operator: 'contains',
          value: [eventType],
        },
      ],
    };
    const res = await this.table.searchTransformed({
      filter,
      field_names: [
        '业务线',
        '事件类型',
        '事件',
        '事件名称',
        '三级模块',
        '四级模块',
      ],
    });
    return res.list || [];
  }
}
