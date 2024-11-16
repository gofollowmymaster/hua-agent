import type { MessageFromRobotType } from '../dto/post-message-from-robot.dto';
import { logger } from '../../middleware/logger.middleware';
export function FromFeishuLogger() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any) {
      //[{"createTime":0,"sender":"","originalContent":"123","content":"","messageType":"","replyContent":"","bacKeywordContent":"","keyword":"","preKeywordContent":""},{"appToken":"S7p0bS7eiaf3aDs7fj4cZmO8nYd","tableId":"tblzNxfa4Xka0dD1"}]
      const { originalContent, sender, replyContent } =
        args[0] as MessageFromRobotType;
      const { appToken, tableId } = args[1];
      logger.info(
        `飞书群消息 【内容是：${originalContent}】【发送人：${sender}}】【引用内容：${replyContent}】【多为表格token：${appToken}】【多维表格tableId：${tableId}】`,
      );
      return originalMethod.apply(this, args);
    };
  };
}
