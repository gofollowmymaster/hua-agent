import FeishuMessageHelper from '@src/common/feishu/helper/message-helper';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { Injectable } from '@nestjs/common';
import { BaseAlertEvent } from './interface';

@Injectable()
export abstract class MsgSenderService {
  protected readonly messageHelper: FeishuMessageHelper;
  protected readonly logger: LoggerService;

  /**
   * 飞书消息发送
   * @param alertInfo
   */
  abstract sendFsAlertMsg(alertInfo: BaseAlertEvent, message: string);
}
