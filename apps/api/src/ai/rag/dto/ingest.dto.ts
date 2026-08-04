import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

/** 描述触发知识库文档索引时可选的执行策略。 */
export class RagIngestDto {
  @ApiPropertyOptional({
    description: '是否强制重新索引 hash 未变化的文档',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
