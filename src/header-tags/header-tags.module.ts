import { Module } from '@nestjs/common';
import { HeaderTagsService } from './header-tags.service';
import { HeaderTagsController } from './header-tags.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [HeaderTagsController],
  providers: [HeaderTagsService, PrismaService],
})
export class VersionModule {}
