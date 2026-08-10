import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@src/common/guard/auth';
import { AgentKnowledgeService } from './agent-knowledge.service';
import {
  AgentKnowledgeDocumentPageDto,
  AgentKnowledgeIngestDto,
  AgentKnowledgeSearchDto,
} from './dto/agent-knowledge.dto';

/** 提供业务 Agent 知识库的入库、检索和文档管理接口。 */
@ApiTags('业务 Agent 知识库')
@Controller('agent/knowledge')
@UseGuards(AuthGuard)
export class AgentKnowledgeController {
  constructor(private readonly agentKnowledgeService: AgentKnowledgeService) {}

  /** 扫描当前租户 docs 目录并触发知识库入库。 */
  @Post('ingest')
  @ApiOperation({ summary: '触发业务 Agent 知识库入库' })
  @ApiBody({ type: AgentKnowledgeIngestDto })
  ingest(@Body() body: AgentKnowledgeIngestDto) {
    return this.agentKnowledgeService.ingest(body);
  }

  /** 按全文、向量或混合模式检索当前租户知识库。 */
  @Post('search')
  @ApiOperation({ summary: '检索业务 Agent 知识库' })
  @ApiBody({ type: AgentKnowledgeSearchDto })
  search(@Body() body: AgentKnowledgeSearchDto) {
    return this.agentKnowledgeService.search(body);
  }

  /** 分页返回当前租户已入库的业务 Agent 文档。 */
  @Get('documents')
  @ApiOperation({ summary: '分页查询业务 Agent 知识库文档' })
  pageDocuments(@Query() query: AgentKnowledgeDocumentPageDto) {
    return this.agentKnowledgeService.pageDocuments(query);
  }

  /** 删除当前租户指定文档及其索引。 */
  @Delete('documents/:id')
  @ApiOperation({ summary: '删除业务 Agent 知识库文档' })
  deleteDocument(@Param('id', ParseIntPipe) id: number) {
    return this.agentKnowledgeService.deleteDocument(id);
  }
}
