import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient as RagPrismaClient } from '@prisma/rag-client';
import { NodeConfigService } from '@src/config/node-config.service';

/** 管理 RAG 数据库 Prisma 客户端及其 NestJS 生命周期。 */
@Injectable()
export class RagPrismaService
  extends RagPrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      datasources: {
        db: {
          url: NodeConfigService.get('databaseUrl'),
        },
      },
    });
  }

  /** 在模块初始化时建立 RAG 数据库连接。 */
  async onModuleInit() {
    await this.$connect();
  }

  /** 在模块销毁时释放 RAG 数据库连接。 */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
