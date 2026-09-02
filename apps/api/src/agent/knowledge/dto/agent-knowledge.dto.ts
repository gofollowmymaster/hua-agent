import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  AgentKnowledgeSearchModeEnum,
  type AgentKnowledgeSearchMode,
} from '../type/agent-knowledge-search.type';

/** 定义触发业务 Agent 知识库入库时的执行策略。 */
export class AgentKnowledgeIngestDto {
  @ApiPropertyOptional({
    description: '是否强制重新索引 hash 未变化的文档',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}

/** 定义业务 Agent 知识库检索条件。 */
export class AgentKnowledgeSearchDto {
  @ApiProperty({ description: '检索问题或关键词' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  query!: string;

  @ApiPropertyOptional({
    description: '检索模式：全文、向量或混合',
    enum: AgentKnowledgeSearchModeEnum,
    default: AgentKnowledgeSearchModeEnum.hybrid,
  })
  @IsOptional()
  @IsEnum(AgentKnowledgeSearchModeEnum)
  mode?: AgentKnowledgeSearchMode;

  @ApiPropertyOptional({ description: '分类过滤，来自 docs 二级目录' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: '返回片段数量，范围 1 到 100',
    default: 8,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  topK?: number;
}

/** 定义业务 Agent 知识库文档分页查询条件。 */
export class AgentKnowledgeDocumentPageDto {
  @ApiPropertyOptional({ description: '文件名、路径或面包屑关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '分类过滤，来自 docs 二级目录' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '文档状态' })
  @IsOptional()
  @IsString()
  status?: string;

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

/** 定义业务 Agent 知识库文档切片分页查询条件。 */
export class AgentKnowledgeChunkPageDto {
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
