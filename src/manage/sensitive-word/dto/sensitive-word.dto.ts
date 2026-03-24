import { ApiProperty } from '@nestjs/swagger';

export class SensitiveWordDto {
  @ApiProperty({
    type: String,
    description: '链接',
  })
  link: string;
  @ApiProperty({
    type: String,
    description: '敏感词',
  })
  sensitiveWord: string;
}
