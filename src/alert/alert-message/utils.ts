import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween'; // nodejs
import { SentryAlertDto } from './dto/sentry-alert.dto';
const { isHoliday } = require('chinese-workday');

dayjs.extend(isBetween);
export const hourTimeBetween = (startHour: number, endHour: number) => {
  console.log(
    "[ dayjs().format('YYYY-MM-DD HH') ] >",
    dayjs().format('YYYY-MM-DD HH'),
  );
  return dayjs(dayjs().format('YYYY-MM-DD HH')).isBetween(
    dayjs().hour(startHour).format('YYYY-MM-DD HH'),
    dayjs().hour(endHour).format('YYYY-MM-DD HH'),
    'hour',
  );
};

/**
 * 是否需要发送加急报警消息
 * @returns boolean
 */
export const isNeedSendAlertMsg = () => {
  if (isHoliday(dayjs().format('YYYY-MM-DD')) && hourTimeBetween(18, 24)) {
    return true;
  }
  if (hourTimeBetween(18, 24)) {
    return true;
  }
  return false;
};

export const buildFeishuTextMsg = (data: SentryAlertDto, userId: string) => {
  const AtUser = userId ? `<at user_id="${userId}"></at>` : '';
  return `{"text":"${data.level}  \\n ${AtUser} \\n 错误：${data.errorMessage}  \\n环境：${data.environment} \\n项目：${data.project}"}`;
};

export const buildFeishuCardMsg = (data: SentryAlertDto, userId: string) => {
  // const AtUser = userId ? `<at user_id="${userId}"></at>` : '';
  return {
    elements: [
      {
        tag: 'div',
        text: {
          content: `你有致命错误需要尽快处理`,
          tag: 'plain_text',
        },
      },
    ],
    header: {
      template: 'red',
      title: {
        content: `【${data.level}]你有致命错误需要尽快处理`,
        tag: 'plain_text',
      },
    },
  };
};

const AlertTemplateId = 'AAqSyNBCovM2j';
const AlertTemplateVersion = '1.0.3';
export const buildFeishuTemplateCardMsg = (data: SentryAlertDto) => {
  // const AtUser = userId ? `<at user_id="${userId}"></at>` : '';
  const errorTime = dayjs(data.timeStamp * 1000).format('YYYY-MM-DD HH:mm:ss');
  console.log('[报警时间 errorTime ] >', errorTime);
  const content = {
    type: 'template',
    data: {
      template_id: AlertTemplateId,
      template_version_name: AlertTemplateVersion,
      template_variable: { ...data, errorTime },
    },
  };
  return JSON.stringify(content);
};
