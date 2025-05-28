import { ConfigService } from '@nestjs/config';
import { ClientFactory, FeishuApp } from './clients';
import FeishuMessageHelper from './hepler/message-helper';
import { FeishuAlertCard } from './card/alert-card';
import dayjs from 'dayjs';
import { AplusError } from '../exception/interface';

/**
 * 使用预配置的 Feishu 客户端向 Feishu 群组发送异常通知。
 *
 * @param exception - 包含错误详细信息的异常对象。
 * @param config - 用于检索必要设置的配置服务实例。
 * 警报卡片中包含一个指向阿里云日志服务的链接，以便进一步调查。
 */
export const sendExceptionToFeishu = (
  exception: AplusError,
  config: ConfigService,
) => {
  const messagerHelper = new FeishuMessageHelper(
    ClientFactory.create(FeishuApp.AlertClient, config),
  );
  const errorTime = dayjs();

  //构建消息内容
  const content = FeishuAlertCard.buildCardMsg({
    environment: process.env.NODE_ENV,
    title: exception.title || 'Node Server异常报警',
    project: 'aplus-sql-server',
    color: 'red',
    culprit: exception.culprit || exception.name,
    errorMessage: exception.message,
    errorTime: errorTime.format('YYYY-MM-DD HH:mm:ss'),
    linkUrl: `https://sls.console.aliyun.com/lognext/project/k8s-log-c893ce02efe464e778e67c48016348406/logsearch/elnkpro-prod-log?encode%3Dbase64%26queryString%3DIF9jb250YWluZXJfbmFtZV86IGFwbHVzLXNxbC1zZXJ2aWNlLXByb2Q%3D%26filterInfo%3DeyJmamNvZGUiOiIoKSIsImZxIjoiIn0%3D%26queryTimeType%3D99%26startTime%3D${errorTime.subtract(60, 's').valueOf() / 1000}%26endTime%3D${errorTime.add(60, 's').valueOf() / 1000}`,
  });
  messagerHelper.createInteractToGroup(
    content,
    config.get('DefaultAlertFeishuGroupId'),
  );
};
