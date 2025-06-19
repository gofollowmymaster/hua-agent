import { Module } from '@nestjs/common';
import WikiDirectoryService from './wiki-directory/index';

@Module({
  providers: [WikiDirectoryService],
  exports: [WikiDirectoryService],
})
export class SchedulTaskeModule {}
