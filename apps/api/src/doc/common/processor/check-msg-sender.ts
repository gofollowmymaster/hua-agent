import { Injectable } from '@nestjs/common';
import { BaseAlertEvent } from '@src/common/base/interface';
import { MsgSenderService } from '@src/common/base/msg-sender.service';
import FeishuMessageHelper from '@src/common/feishu/helper/message-helper';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { NodeConfigService } from '@src/config/node-config.service';

@Injectable()
export class WikiMsgSenderService extends MsgSenderService {
  constructor(
    protected readonly feishuMessageHelper: FeishuMessageHelper,
    protected readonly tenantContext: TenantContext,
  ) {
    super();
  }
  async sendFsAlertMsg(alertInfo: BaseAlertEvent, message: string) {
    return this.feishuMessageHelper.createInteractToGroup(
      message,
      NodeConfigService.getTenantConfigItem(
        this.tenantContext.tenant,
        'WikiBlackListCheckoutGroupId',
      ),
    );
  }
}
