import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeishuApp } from '@src/common/feishu/clients';
import { BitTableFilter } from '@src/common/feishu/type/bitable';
import { IsNotEmpty, IsNotEmptyObject } from 'class-validator';

export type TableHeaderType = {
  appToken: string;
  tableId: string;
  robotName?: FeishuApp;
  [key: string]: string;
};

export class SearchParamsDto {
  @ApiPropertyOptional({
    type: Object,
    description: '过滤条件',
  })
  filter: BitTableFilter;
}

export class BatchDeleteParamsDto {
  @IsNotEmpty({ message: '参数recordIds不能为空' })
  @ApiProperty({
    type: Array,
    description: '需要删除的记录ID集合',
  })
  recordIds: string[];
}

export class DeleteRecordParamsDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '需要删除的记录ID',
  })
  recordId: string;
}
export class UpdateRecordParamsDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '需要修改的记录ID',
  })
  recordId: string;
  @IsNotEmpty()
  @ApiProperty({
    type: Object,
    description: '记录内容',
  })
  data: Record<string, string>;
}
export class CreateRecordParamsDto {
  @IsNotEmptyObject()
  @ApiProperty({
    type: Object,
    description: '记录内容',
  })
  records: Record<string, string>;
}
