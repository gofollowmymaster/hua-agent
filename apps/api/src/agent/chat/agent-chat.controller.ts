import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { pipeUIMessageStreamToResponse } from 'ai';
import { SkipTransform } from '@src/common/decorator/skip-transform.decorator';
import { CompositeAuthOrSecretGuard } from '@src/common/guard/composite-auth';
import { AgentChatSessionPageDto } from './dto/agent-chat.dto';
import { AgentChatMemoryService } from './service/agent-chat-memory.service';
import { AgentChatService } from './service/agent-chat.service';
import type { AgentChatRequest } from './type/agent-chat.type';

/** 提供业务 Agent 多工具聊天、会话和消息接口。 */
@ApiTags('业务 Agent Chat')
@Controller('agent/chat')
@UseGuards(CompositeAuthOrSecretGuard)
export class AgentChatController {
  constructor(
    private readonly agentChatService: AgentChatService,
    private readonly agentChatMemoryService: AgentChatMemoryService,
  ) {}

  /** 将 AGUI 聊天请求适配为多工具 Agent 流式响应。 */
  @SkipTransform()
  @Post()
  @ApiOperation({ summary: '业务 Agent 流式聊天' })
  chat(
    @Body() body: AgentChatRequest,
    @Res({ passthrough: false }) res: Response,
  ) {
    const stream = this.agentChatService.createChatStream(body ?? {});
    pipeUIMessageStreamToResponse({
      response: res,
      stream,
    });
  }

  /** 分页返回当前租户的 Agent 历史会话。 */
  @Post('sessions/page')
  @ApiOperation({ summary: '分页查询业务 Agent 历史会话' })
  @ApiBody({ type: AgentChatSessionPageDto })
  pageSessions(@Body() body: AgentChatSessionPageDto) {
    return this.agentChatMemoryService.pageSessions(body);
  }

  /** 返回指定 Agent 会话的完整消息。 */
  @Get('sessions/:id/messages')
  @ApiOperation({ summary: '查询业务 Agent 会话消息' })
  listSessionMessages(@Param('id', ParseIntPipe) id: number) {
    return this.agentChatMemoryService.listSessionMessages(id);
  }
}
