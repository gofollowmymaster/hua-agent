import type {
  customResponse,
  MessageFromRobotType,
} from '../../dto/post-message-from-robot.dto';
import {
  hasCurrentQuestion,
  returnMessage,
  computedPayloadFields,
  computedPayloadRelateToFields,
} from '.';
import { FromFeishuLogger } from '../../logUtils';
import { Injectable } from '@nestjs/common';

import { listTableField } from '@src/common/utils/actionTable/listTableField';
import { updateTableRecord } from '@src/common/utils/actionTable/updateTableRecord';
import { ErrorMessages, ErrorMessagesCode } from './errEnum';
import { logger } from '@src/common/service/logger/logger.config';
import { addTableRecord } from '@src/common/utils/actionTable/addTableRecord';
const dayjs = require('dayjs');

@Injectable()
export class FeishuSenseService {
  // 场景 1 @小A 这是一个问题 但消息内容上无引用内容 则认为为这是一个需要记录的问题
  // 场景 2 使用引用消息 @小A 但是@小A后无内容 则同样认为为这是一个需要记录的问题
  @FromFeishuLogger()
  async runSenseOne(
    MessageFromRobot: MessageFromRobotType,
    headers: { appToken: string; tableId: string },
  ): Promise<customResponse> {
    const { originalContent, replyContent, sender } = MessageFromRobot;
    const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const { appToken, tableId } = headers;
    const writeContent = originalContent || replyContent;
    const res = await hasCurrentQuestion(
      appToken,
      tableId,
      '问题描述',
      writeContent,
    );

    const isMessageExist = res.record_id !== '';

    //如果消息已经存在于表格中则不再写入
    if (isMessageExist) {
      logger.info(`【${writeContent}】消息已存在,时间为${time}`);
      return returnMessage(
        ErrorMessagesCode.MESSAGE_EXIST_CODE,
        res.record_id,
        `【${writeContent}】${ErrorMessages.MESSAGE_EXIST},时间为${time}`,
      );
    }
    //消息不存在
    //查询当前多维表格列记录
    const listFieldRes = await listTableField(appToken, tableId);

    if (listFieldRes.code >= 0 && listFieldRes.data.items.length > 0) {
      const list = listFieldRes.data.items;
      //如果消息不存在于表格中则写入
      const addRes = await addTableRecord(
        appToken,
        tableId,
        computedPayloadFields(list, writeContent, sender),
      );
      if (addRes.code === 0) {
        logger.info(`【${writeContent}】消息写入成功,时间为${time}`);
        return returnMessage(
          0,
          res.record_id,
          `【${writeContent}】消息写入成功,时间为${time}`,
        );
      } else {
        logger.info(`【${writeContent}】消息写入失败,时间为${time}`);
        return returnMessage(
          10000,
          res.record_id,
          `【${writeContent}】消息写入失败,时间为${time}`,
        );
      }
    } else {
      logger.info(
        `【${ErrorMessages.COLUMNS_NOT_EXIST}】消息写入失败,时间为${time}`,
      );
      return returnMessage(
        ErrorMessagesCode.COLUMNS_NOT_EXIST,
        null,
        `【${writeContent}】${ErrorMessages.COLUMNS_NOT_EXIST},时间为${time}`,
      );
    }
  }
  // 场景 3 使用引用消息 @小A 但是@小A后有内容
  //则认为为这是一个需要记录的回复（“引用消息”就作为本次回复内容，需要去表里面查找是否有对应的问题）
  @FromFeishuLogger()
  async runSenseTwo(
    MessageFromRobot: MessageFromRobotType,
    headers: { appToken: string; tableId: string },
  ): Promise<customResponse> {
    const { originalContent, replyContent, sender } = MessageFromRobot;
    const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const { appToken, tableId } = headers;
    const res = await hasCurrentQuestion(
      appToken,
      tableId,
      '问题描述',
      replyContent,
    );

    const isMessageExist = res.record_id !== '';

    //如果消息已经存在于表格中则不再写入
    if (isMessageExist) {
      const record_id = res.record_id;
      //const res = await updateTableRecord(appToken, tableId, record_id, {
      //查询当前多维表格列记录
      const listFieldRes = await listTableField(appToken, tableId);
      logger.info(
        `【${listFieldRes.data.items}查询当前多维表格列记录,时间为${time}`,
      );
      if (listFieldRes.code >= 0 && listFieldRes.data.items.length > 0) {
        const list = listFieldRes.data.items;
        //如果消息不存在于表格中则写入
        const addRes = await updateTableRecord(
          appToken,
          tableId,
          record_id,
          computedPayloadRelateToFields(list, originalContent, sender),
        );
        if (addRes.code === 0) {
          logger.info(`【${originalContent}】消息修改成功,时间为${time}`);
          return returnMessage(
            0,
            res.record_id,
            `【${originalContent}】消息修改成功,时间为${time}`,
          );
        } else {
          logger.info(`【${originalContent}】消息修改失败,时间为${time}`);
          return returnMessage(
            10000,
            res.record_id,
            `【${originalContent}】消息修改失败,时间为${time}`,
          );
        }
      } else {
        logger.info(
          `【${ErrorMessages.COLUMNS_NOT_EXIST}】消息写入失败,时间为${time}`,
        );
        return returnMessage(
          ErrorMessagesCode.COLUMNS_NOT_EXIST,
          null,
          `【${originalContent}】${ErrorMessages.COLUMNS_NOT_EXIST},时间为${time}`,
        );
      }
    }
  }
}
