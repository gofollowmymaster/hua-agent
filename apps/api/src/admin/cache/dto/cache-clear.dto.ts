import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RedisValueType } from '@src/common/service/redis/redis.service';
import { IsNotEmpty } from 'class-validator';

export enum KeyType {
  多维表格 = '多维表格',
  自定义键 = '自定义键',
}
export class CacheClearDto {
  @ApiProperty({
    type: String,
    description: '键名',
  })
  key: string;
  @ApiProperty({
    type: String,
    description: '表格',
  })
  table: string;
  @ApiPropertyOptional({
    enum: KeyType,
    description: '键类型',
  })
  type?: KeyType;
}

export class CacheGetDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '键名',
  })
  key: string;

  @ApiPropertyOptional({
    enum: RedisValueType,
    description: '值类型',
  })
  type?: RedisValueType;
}
