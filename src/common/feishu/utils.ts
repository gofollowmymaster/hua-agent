import { ConfigService } from '@nestjs/config';
import { ClientFactory, FeishuApp } from './clients';
import FeishuMessageHelper from './hepler/message-helper';
import { CommonAlertCard, CommonCardData } from './card/alert-card';
import dayjs from 'dayjs';
import { getGlobalAppInstance } from '@utils/app-config';
import { throttle } from 'lodash';
/**
 * 使用预配置的 Feishu 客户端向 Feishu 群组发送异常通知。
 *
 * @param exception - 包含错误详细信息的异常对象。
 * @param config - 用于检索必要设置的配置服务实例。
 * 警报卡片中包含一个指向阿里云日志服务的链接，以便进一步调查。
 */

export const sendExceptionToFeishuOrigin = (
  exception: Error,
  reqContext: string = '',
) => {
  //构建消息内容
  const options = {
    title: `Node Server异常报警【${exception.name}】`,
    project: 'aplus-sql-server',
    color: 'red',
    message: exception.message || '内部错误',
    content: reqContext || exception.stack,
  };
  console.log('[   exception ] >', exception.message, exception.stack);
  sendCommonCardToFeishu(options);
};

export const sendCommonCardToFeishu = (options: CommonCardData) => {
  const config = getGlobalAppInstance(ConfigService);
  const messagerHelper = new FeishuMessageHelper(
    ClientFactory.create(FeishuApp.AlertClient, config),
  );
  const errorTime = dayjs();

  //构建消息内容
  const content = CommonAlertCard.buildCardMsg({
    environment: process.env.NODE_ENV,
    title: options.title,
    project: options.project || 'aplus-sql-server',
    color: options.color,
    message: options.message || '内部错误',
    content: options.content || '未知错误',
    timestamp: errorTime.valueOf(),
    linkUrl: `https://sls.console.aliyun.com/lognext/project/k8s-log-c893ce02efe464e778e67c48016348406/logsearch/elnkpro-prod-log?encode%3Dbase64%26queryString%3DIF9jb250YWluZXJfbmFtZV86IGFwbHVzLXNxbC1zZXJ2aWNlLXByb2Q%3D%26filterInfo%3DeyJmamNvZGUiOiIoKSIsImZxIjoiIn0%3D%26queryTimeType%3D99%26startTime%3D${errorTime.subtract(60, 's').valueOf() / 1000}%26endTime%3D${errorTime.add(60, 's').valueOf() / 1000}`,
  });

  messagerHelper.createInteractToGroup(
    content,
    config.get('DefaultAlertFeishuGroupId'),
  );
};

export const sendExceptionToFeishu: (
  exception: Error,
  reqContext?: string,
) => void = throttle(sendExceptionToFeishuOrigin, 200, {
  leading: true,
  trailing: false,
});
