import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient as RagPrismaClient } from '@prisma/rag-client';
import { NodeConfigService } from '@src/config/node-config.service';

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

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
