import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import type { records } from '../../common/utils/actionTable/interface';
import { FeishuMsgType, ReceiveIdType } from '@src/common/feishu/type/im';
import { FeishuApp, FeishuAppClentsType } from '@src/common/feishu/clients';
/**
 * 
  参考一下数据帮我生成一个包含支持nestjs/swagger的类{
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
export class MessageFromRobotDto {
  @ApiProperty({
    type: Number,
    description: '创建时间',
  })
  createTime: number;
  @ApiProperty({
    type: String,
    description: '发送人',
  })
  sender: string;
  @ApiProperty({
    type: String,
    description: '源消息内容',
  })
  originalContent: string;
  @ApiProperty({
    type: String,
    description: '消息内容',
  })
  content: string;
  @ApiProperty({
    type: String,
    description: '消息类型',
  })
  messageType: string;
  @ApiProperty({
    type: String,
    description: '被回复的消息内容',
  })
  replyContent: string;
  //关键词后的内容 string;
  @ApiPropertyOptional({
    type: String,
    description: '关键词后的内容',
  })
  bacKeywordContent: string;
  @ApiProperty({
    type: String,
    description: '关键词',
  })
  keyword: string;
  @ApiPropertyOptional({
    type: String,
    description: '关键词前的内容',
  })
  preKeywordContent: string;
}
export class SearchParamsDto {
  @ApiPropertyOptional({
    type: Object,
    description: '记录数据',
  })
  records?: records;
  @ApiPropertyOptional({
    type: Object,
    description: '其他数据',
  })
  data?: object;
  @ApiPropertyOptional({
    type: String,
    description: '记录id',
  })
  record_id?: string;
}
export class TableRecords extends PickType(SearchParamsDto, ['records']) {}
export class TableRecordId extends PickType(SearchParamsDto, ['record_id']) {}
export class TableRecordsOrId extends PickType(SearchParamsDto, [
  'records',
  'record_id',
]) {}

export type customResponse = {
  code: number;
  data: any;
  message: string;
};
export type MessageFromRobotType = {
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
};

export class FeishuMessageSenderDto {
  @ApiProperty({
    type: String,
    description: '接受对象ID',
  })
  receive_id: string;
  @ApiProperty({
    enum: FeishuMsgType,
    description: '消息类型',
  })
  msg_type: FeishuMsgType;
  @ApiProperty({
    type: String,
    description: '消息内容',
  })
  content: string;
  @ApiPropertyOptional({
    type: String,
    description: 'uuid',
  })
  uuid?: string;
  @ApiPropertyOptional({
    enum: ReceiveIdType,
    default: ReceiveIdType.ChatId,
    description: '接收对象类型',
  })
  receive_id_type?: ReceiveIdType;
}

export class FeishuTicketDto {
  @ApiProperty({
    enum: FeishuApp,
    description: '飞书应用名称',
  })
  appName: FeishuAppClentsType;
}
