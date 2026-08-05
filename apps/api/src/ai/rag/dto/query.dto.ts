import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

/** 承载同步 RAG 问答所需的问题、检索和会话上下文。 */
export class RagQueryDto {
  @ApiProperty({ description: '用户问题' })
  @IsString()
  question!: string;

  @ApiPropertyOptional({
    description: '检索片段数量，范围 1 到 20',
    default: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  topK?: number;

  @ApiPropertyOptional({
    description: '渠道会话 ID，如群聊 ID、单聊 ID、页面会话 ID',
  })
  @IsOptional()
  @IsString()
  conversationId?: string;

  @ApiPropertyOptional({ description: '渠道会话类型，如 group、single、room' })
  @IsOptional()
  @IsString()
  conversationType?: string;

  @ApiPropertyOptional({ description: '提问用户或参与者 ID' })
  @IsOptional()
  @IsString()
  participantId?: string;

  @ApiPropertyOptional({ description: '渠道扩展上下文' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
