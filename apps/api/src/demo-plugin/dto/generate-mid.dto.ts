import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GenerateMidDto {
  @ApiPropertyOptional({
    type: String,
    description: '消息ID',
  })
  recordId: string; // 消息ID
}

export class VerifyMidDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '密钥',
  })
  MId: string; // 消息ID
  @ApiPropertyOptional({
    type: String,
    description: '公司名',
  })
  CompanyName: string; // 消息ID
}
