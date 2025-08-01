import { Module } from '@nestjs/common';
import WikiDirectoryService from './wiki-directory/index';
import FixedTokenService from './load-fixed-token/index';
import ClearAlertIssueInService from './clear-alert-issue/index';
import SyncFeishuUserService from './sync-feishu-user/index';

@Module({
  providers: [
    WikiDirectoryService,
    FixedTokenService,
    ClearAlertIssueInService,
    SyncFeishuUserService,
  ],
  exports: [
    WikiDirectoryService,
    FixedTokenService,
    ClearAlertIssueInService,
    SyncFeishuUserService,
  ],
})
export class SchedulTaskeModule {}
