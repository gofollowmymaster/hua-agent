import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export enum KeyType {
  '多维表格' = '多维表格',
  自定义键 = '自定义键',
}
export class CacheClearDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '键名',
  })
  key: string;
  @ApiPropertyOptional({
    enum: KeyType,
    description: '键类型',
  })
  type?: KeyType;
}
