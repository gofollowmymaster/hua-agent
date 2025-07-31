import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Environment, ErrorLevel } from '@src/alert/common/type/alert';
import { IsNotEmpty } from 'class-validator';

export class SentryAlertDto {
  @IsNotEmpty()
  @ApiProperty({
    enum: Environment,
    description: '环境',
  })
  environment: Environment;
  @ApiPropertyOptional({
    type: String,
    description: '完整原始 JSON 字符串',
  })
  rawData: string;
  @ApiProperty({
    type: String,
    description: '标题',
  })
  errorMessage: string;
  @ApiPropertyOptional({
    type: String,
    description: '用户邮箱',
  })
  userEmail: string;
  @ApiProperty({
    type: String,
    description: '项目名称',
  })
  project: string;
  @ApiProperty({
    type: String,
    description: '信息链接',
  })
  linkUrl: string;
  @ApiProperty({
    enum: ErrorLevel,
    description: '报警级别',
  })
  level: ErrorLevel;
  @ApiPropertyOptional({
    type: String,
    description: '类型',
  })
  eventType: string;
  @ApiProperty({
    type: String,
    description: '打点摘要',
  })
  culprit: string;
  @ApiProperty({
    type: Number,
    description: '发生时间戳',
  })
  timeStamp: number;
}

export class ReadMsgCallbackDto {
  schema: string;

  header: Record<string, any>;

  event: Record<string, any>;
}
