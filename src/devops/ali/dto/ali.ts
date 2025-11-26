import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AliDevopsDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '研发流程环境',
  })
  env: string;

  @ApiProperty({
    type: String,
    description: '应用研发流程名',
  })
  apps?: string[];
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '发布内容描述',
  })
  content?: string;

  @ApiProperty({
    type: String,
    description: '操作人',
  })
  operator: string;
}
