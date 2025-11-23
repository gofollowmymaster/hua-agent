import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AliDevopsDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '文档标识，作为文档的唯一标识符',
  })
  tag: string;
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '模块标识，将决定文档存在于哪一个知识库父节点',
  })
  module: string;
}
