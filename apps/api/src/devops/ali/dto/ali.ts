import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
    description: '发布内容描述',
  })
  content?: string;

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

  @ApiPropertyOptional({
    type: Array<string>,
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

export class PublishLogDataDto {
  @ApiProperty({
    type: String,
    description: '环境',
  })
  环境: string;
  @ApiProperty({
    type: [String],
    description: '应用',
  })
  应用: string[];
  @ApiPropertyOptional({
    type: String,
    description: '更新描述',
  })
  更新描述?: string;
  @ApiProperty({
    type: String,
    description: '发起人',
  })
  发起人: string;
  @ApiPropertyOptional({
    type: [String],
    description: '测试人员列表',
  })
  测试人员?: string[];
  [key: string]: any;
}
export class PublishCreateDataDto {
  @IsNotEmpty()
  @ApiProperty({
    type: PublishLogDataDto,
    description: '记录信息',
  })
  records: PublishLogDataDto;
}
