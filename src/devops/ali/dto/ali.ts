import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AliDevopsDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '研发流程环境',
  })
  env: string;

  @ApiPropertyOptional({
    type: [String],
    description: '应用研发流程名列表(数组形式)',
  })
  apps?: string[];

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
}
export class AliDevopsControllerDto extends AliDevopsDto {
  @ApiPropertyOptional({
    type: String,
    description: '应用研发流程名列表(字符串形式)',
  })
  appsStr?: string;
}
