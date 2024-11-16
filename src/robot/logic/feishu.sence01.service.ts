import type {
  customResponse,
  MessageFromRobotType,
} from '../dto/post-message-from-robot.dto';
import { hasCurrentQuestion } from '.';
import { FromFeishuLogger } from '../logUtils';
import { Injectable } from '@nestjs/common';
const dayjs = require('dayjs');
// 场景 1 @小A 这是一个问题 但消息内容上无引用内容 则认为为这是一个需要记录的问题
/**
   * 
   * {
      "sender": "Ollie.liu",
      "messageType": "GROUP",
      "keyword": "--",
      "preKeywordContent": "",
      "createTime": "2024/11/16 12:17",
      "originalContent": "123",
      "content": "@小A 123",
      "replyContent": "",
      "bacKeywordContent": "--"
  }
 */
@Injectable()
export class feishuSence01Service {
  @FromFeishuLogger()
  async run(
    MessageFromRobot: MessageFromRobotType,
    headers: { appToken: string; tableId: string },
  ): Promise<customResponse> {
    // 场景 1 @小A 这是一个问题 但消息内容上无引用内容 则认为为这是一个需要记录的问题
    const { originalContent, replyContent } = MessageFromRobot;
    const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const { appToken, tableId } = headers;

    if (originalContent !== '' && replyContent == '') {
      console.log('originalContent', originalContent);
      const res = await hasCurrentQuestion(
        appToken,
        tableId,
        '问题描述',
        originalContent,
      );

      return {
        code: 0,
        data: res.record_id,
        message: `【${originalContent}】消息写入成功,时间为${time}`,
      };
    }
    return {
      code: 10000,
      data: null,
      message: `【${originalContent}】消息写入失败,时间为${time}`,
    };
  }
}
