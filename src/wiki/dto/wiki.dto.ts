import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

// export enum Environment {
//   PRODUCTION = 'production',
//   UAT = 'uat',
//   TEST = 'test',
//   DEV = 'dev',
// }

export class WikiDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '消息ID',
  })
  messageId: string; // 消息ID

  // remark?: string; // 备注，非必填项
}
