import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { LoggerService } from '../src/common/service/logger/logger.service';
import { RagPrismaService } from '../src/common/service/rag-prisma/rag-prisma.service';
import { AgentKnowledgeIngestService } from '../src/agent/knowledge/service/agent-knowledge-ingest.service';

/** 独立入库程序专用最小上下文，只连接 RAG 数据库。 */
@Module({
  providers: [RagPrismaService, LoggerService, AgentKnowledgeIngestService],
})
class AgentKnowledgeCliModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(
    AgentKnowledgeCliModule,
    {
      logger: ['error', 'warn'],
    },
  );
  const ingestService = app.get(AgentKnowledgeIngestService);
  const force = process.argv.includes('--force');
  const summary = await ingestService.ingest({ force });
  console.log(JSON.stringify(summary, null, 2));
  await app.close();

  if (summary.failedFiles > 0) {
    process.exitCode = 1;
  }
}

bootstrap().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
