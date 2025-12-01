import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsNotEmpty } from 'class-validator';

export class AliDevopsDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '研发流程环境',
  })
  env: string;

  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '发布内容描述',
  })
  content: string;

  @ApiProperty({
    type: String,
    description: '操作人',
  })
  operator: string;
  apps: string[];
  testUser?: string[];
}
export class AliDevopsCommonDto extends AliDevopsDto {
  @IsNotEmpty()
  @ApiPropertyOptional({
    type: [String],
    description: '应用研发流程名列表',
  })
  apps: string[];

  @IsNotEmpty()
  @ArrayMaxSize(5, { message: '最多只能选择5个标签' })
  @ApiPropertyOptional({
    type: String,
    description: '需要提醒的人员',
  })
  testUser?: string[];
}
export class AliDevopsByFeishuDto extends AliDevopsDto {
  @ApiPropertyOptional({
    type: String,
    description: '应用研发流程名列表',
  })
  appsStr?: string;
  @ApiPropertyOptional({
    type: String,
    description: '需要提醒的人员',
  })
  testUserStr?: string;
}
