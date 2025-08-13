import { Module } from '@nestjs/common';
import WikiDirectoryService from './wiki-directory/index';
import SyncFeishuUserService from './sync-feishu-user/index';
// import AlertStatisticService from './alert-statistic';
// import FeishuApiAlertIssueTable from '@src/alert/common/table/api-alert-issue-table';

@Module({
  // import
  providers: [
    WikiDirectoryService,
    SyncFeishuUserService,
    // AlertStatisticService,
    // FeishuApiAlertIssueTable,
  ],
  exports: [WikiDirectoryService, SyncFeishuUserService],
})
export class SchedulTaskeModule {}
