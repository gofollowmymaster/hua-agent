import { Module } from '@nestjs/common';
import { AgentKnowledgeController } from './knowledge/agent-knowledge.controller';
import { AgentKnowledgeService } from './knowledge/agent-knowledge.service';
import { AgentKnowledgeIngestService } from './knowledge/service/agent-knowledge-ingest.service';
import { AgentKnowledgeSearchService } from './knowledge/service/agent-knowledge-search.service';
import { AgentChatController } from './chat/agent-chat.controller';
import { AgentChatAgentService } from './chat/service/agent-chat-agent.service';
import { AgentChatMemoryService } from './chat/service/agent-chat-memory.service';
import { AgentChatService } from './chat/service/agent-chat.service';
import { AgentChatToolService } from './chat/service/agent-chat-tool.service';

/** 业务 Agent 独立业务域入口，后续承载知识库、skill、会话、配置与演示能力。 */
@Module({
  controllers: [AgentKnowledgeController, AgentChatController],
  providers: [
    AgentKnowledgeService,
    AgentKnowledgeIngestService,
    AgentKnowledgeSearchService,
    AgentChatMemoryService,
    AgentChatToolService,
    AgentChatAgentService,
    AgentChatService,
  ],
  exports: [AgentKnowledgeIngestService],
})
export class AgentModule {}
