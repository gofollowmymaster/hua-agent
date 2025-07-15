import { ApiProperty } from '@nestjs/swagger';

export class AplusResponse<T> {
  @ApiProperty({
    type: Number,
    description: '返回码',
  })
  code: number;
  @ApiProperty({
    type: String,
    description: '返回信息',
  })
  message: string;
  @ApiProperty({
    type: Object,
    description: '返回数据',
  })
  body: T;
}
