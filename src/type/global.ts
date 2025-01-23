import { ApiProperty } from '@nestjs/swagger';

export class AplusResponse<T> {
  @ApiProperty({
    type: 'string',
    description: '返回码',
  })
  code: number;
  @ApiProperty({
    type: 'string',
    description: '返回信息',
  })
  message: string;

  data: T;
}
