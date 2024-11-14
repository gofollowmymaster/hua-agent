import type { records } from '../../utils/actionTable/interface';
export class MessageFromRobotDto {
  //创建时间 string
  createTime: number;
  //发送人 string
  sender: string;
  //源消息内容 去掉 @ string
  originalContent: string;
  //消息内容 string
  content: string;
  //消息类型 string
  messageType: string;
  //被回复的消息内容 string
  replyContent: string;
  //关键词后的内容 string;
  bacKeywordContent: string;
  //关键词 string
  keyword: string;
  //关键词前的内容 string
  preKeywordContent: string;
  records?: records;
  data?: object;
  record_id?: string;
}
