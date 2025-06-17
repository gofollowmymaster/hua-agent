import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GenerateMidDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '消息ID',
  })
  recordId: string; // 消息ID
}
