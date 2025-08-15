import { Module } from '@nestjs/common';
import SyncFeishuUserService from './sync-feishu-user/index';
// import AlertStatisticService from './alert-statistic';
// import FeishuApiAlertIssueTable from '@src/alert/common/table/api-alert-issue-table';

@Module({
  // import
  providers: [
    SyncFeishuUserService,
    // AlertStatisticService,
    // FeishuApiAlertIssueTable,
  ],
  exports: [SyncFeishuUserService],
})
export class SchedulTaskeModule {}
