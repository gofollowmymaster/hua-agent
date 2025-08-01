import { Module } from '@nestjs/common';
import WikiDirectoryService from './wiki-directory/index';
import FixedTokenService from './load-fixed-token/index';
import ClearAlertIssueInService from './clear-alert-issue/index';

@Module({
  providers: [
    WikiDirectoryService,
    FixedTokenService,
    ClearAlertIssueInService,
  ],
  exports: [WikiDirectoryService, FixedTokenService, ClearAlertIssueInService],
})
export class SchedulTaskeModule {}
