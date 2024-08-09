import { Module } from '@nestjs/common';
import { VersionService } from './version.service';
import { VersionController } from './version.controller';
import { PrismaService } from '../prisma.service';
import { HeaderTagsService } from '../header-tags/header-tags.service';

@Module({
  controllers: [VersionController],
  providers: [VersionService, PrismaService, HeaderTagsService],
})
export class VersionModule {}
