import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { pipeUIMessageStreamToResponse } from 'ai';
import { SkipTransform } from '@src/common/decorator/skip-transform.decorator';
import { RagService, type RagChatRequest } from './rag.service';
import { AuthGuard } from '@src/common/guard/auth';

/** 提供 RAG Admin 问答助手使用的 AGUI 聊天接口。 */
@ApiTags('RAG 企业知识库')
@Controller('ai/rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  /** 将 AGUI 聊天请求适配为 UI Message 流并写入 HTTP 响应。 */
  @SkipTransform()
  @Post('chat')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'AGUI 协议 RAG 问答' })
  chat(
    @Body() body: RagChatRequest,
    @Res({ passthrough: false }) res: Response,
  ) {
    const stream = this.ragService.createChatStream(body ?? {});
    pipeUIMessageStreamToResponse({
      response: res,
      stream,
    });
  }
}
