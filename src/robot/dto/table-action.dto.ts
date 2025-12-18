import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import type { records } from '../../common/utils/actionTable/interface';

export type TableHeaderType = { appToken: string; tableId: string };

export class SearchParamsDto {
  @ApiPropertyOptional({
    type: Object,
    description: '记录数据',
  })
  records?: records;
  @ApiPropertyOptional({
    type: Object,
    description: '其他数据',
  })
  data?: object;
  @ApiPropertyOptional({
    type: String,
    description: '记录id',
  })
  record_id?: string;
}
export class TableRecords extends PickType(SearchParamsDto, ['records']) {}
export class TableRecordId extends PickType(SearchParamsDto, ['record_id']) {}
export class TableRecordsOrId extends PickType(SearchParamsDto, [
  'records',
  'record_id',
]) {}

export class BatchDeleteParamsDto {
  @ApiProperty({
    type: Array,
    description: '需要删除的记录ID集合',
  })
  recordIds: string[];
}
