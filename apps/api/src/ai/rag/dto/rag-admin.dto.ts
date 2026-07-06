import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class RagAdminPageDto {
  @ApiPropertyOptional({ description: '页码，从 1 开始', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量，最大 100', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}

export class RagAdminDocumentPageDto extends RagAdminPageDto {
  @ApiPropertyOptional({ description: '文件名或来源路径关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '文档状态' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: '更新时间开始，ISO 日期字符串' })
  @IsOptional()
  @IsDateString()
  updatedFrom?: string;

  @ApiPropertyOptional({ description: '更新时间结束，ISO 日期字符串' })
  @IsOptional()
  @IsDateString()
  updatedTo?: string;
}

export class RagAdminDocumentChunkPageDto extends RagAdminPageDto {}

export class RagAdminIngestDto {
  @ApiPropertyOptional({
    description: '是否强制重新索引 hash 未变化的文档',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}

export class RagAdminSessionPageDto extends RagAdminPageDto {
  @ApiPropertyOptional({ description: '渠道，如 http、wecom' })
  @IsOptional()
  @IsString()
  channel?: string;

  @ApiPropertyOptional({ description: '会话 ID' })
  @IsOptional()
  @IsString()
  conversationId?: string;

  @ApiPropertyOptional({ description: '会话类型，如 rag-chat' })
  @IsOptional()
  @IsString()
  conversationType?: string;

  @ApiPropertyOptional({ description: '用户 ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: '会话或消息关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '最后活跃时间开始，ISO 日期字符串' })
  @IsOptional()
  @IsDateString()
  activeFrom?: string;

  @ApiPropertyOptional({ description: '最后活跃时间结束，ISO 日期字符串' })
  @IsOptional()
  @IsDateString()
  activeTo?: string;
}
