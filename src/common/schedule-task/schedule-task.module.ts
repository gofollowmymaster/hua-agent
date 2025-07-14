import { Module } from '@nestjs/common';
import WikiDirectoryService from './wiki-directory/index';
import FixedTokenService from './load-fixed-token/index';

@Module({
  providers: [WikiDirectoryService, FixedTokenService],
  exports: [WikiDirectoryService, FixedTokenService],
})
export class SchedulTaskeModule {}
