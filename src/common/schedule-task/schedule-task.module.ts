import { Module } from '@nestjs/common';
import WikiDirectoryService from './wiki-directory/index';
import FixedTokenService from './load-fixed-token/index';
import ClearAlertIssueInService from './clear-alert-issue/index';
import SyncFeishuUserService from './sync-feishu-user/index';
// import AlertStatisticService from './alert-statistic';
// import FeishuApiAlertIssueTable from '@src/alert/common/table/api-alert-issue-table';

@Module({
  // import
  providers: [
    WikiDirectoryService,
    FixedTokenService,
    ClearAlertIssueInService,
    SyncFeishuUserService,
    // AlertStatisticService,
    // FeishuApiAlertIssueTable,
  ],
  exports: [
    WikiDirectoryService,
    FixedTokenService,
    ClearAlertIssueInService,
    SyncFeishuUserService,
  ],
})
export class SchedulTaskeModule {}
