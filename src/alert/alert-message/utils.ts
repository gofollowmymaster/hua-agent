import dayjs, { Dayjs, OpUnitType } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween'; // nodejs
import { SentryAlertDto } from './dto/sentry-alert.dto';
import getSendInfoByProject from './app-user-map';

const { isWorkday } = require('chinese-workday');

const isHoliday = (day: number) => {
  console.log(
    '[ 1737367108 ] >',
    !isWorkday(day),
    dayTimeBetween('2025-01-22', '2025-02-05', day),
  );
  return !isWorkday(day) || dayTimeBetween('2025-01-22', '2025-02-05', day);
};

dayjs.extend(isBetween);
export const hourTimeBetween = (
  startHour: number,
  endHour: number,
  time: number,
) => {
  return dayjs(dayjs(time).tz('Asia/Shanghai').format('YYYY-MM-DD HH'))
    .tz('Asia/Shanghai')
    .isBetween(
      dayjs().tz('Asia/Shanghai').hour(startHour).format('YYYY-MM-DD HH'),
      dayjs().tz('Asia/Shanghai').hour(endHour).format('YYYY-MM-DD HH'),
      'hour',
    );
};

export const dayTimeBetween = (
  startDay: string,
  endDay: string,
  time: number,
) => {
  return dayjs(dayjs(time).tz('Asia/Shanghai').format('YYYY-MM-DD'))
    .tz('Asia/Shanghai')
    .isBetween(startDay, endDay, 'day');
};

/**
 * 是否需要发送加急报警消息
 * @returns boolean
 */
export const isNeedSendAlertMsg = (time: number) => {
  time = time * 1000;
  console.log('[ time ] >', isHoliday(time), hourTimeBetween(18, 24, time));
  if (isHoliday(time) && hourTimeBetween(9, 24, time)) {
    return true;
  }
  if (hourTimeBetween(18, 24, time)) {
    return true;
  }
  return false;
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
const AlertTemplateVersion = '1.0.8';
export const buildFeishuTemplateCardMsg = (alertInfo: SentryAlertDto) => {
  // const AtUser = userId ? `<at user_id="${userId}"></at>` : '';
  const { userId } = getSendInfoByProject(alertInfo.project);
  const errorTime = dayjs(alertInfo.timeStamp * 1000).format(
    'YYYY-MM-DD HH:mm:ss',
  );
  const title = alertInfo.level == 'fatal' ? '高危报警' : '异常报警';
  const color = alertInfo.level == 'fatal' ? 'red' : 'orange';
  const content = {
    type: 'template',
    data: {
      template_id: AlertTemplateId,
      template_version_name: AlertTemplateVersion,
      template_variable: { ...alertInfo, errorTime, userId, title, color },
    },
  };
  return JSON.stringify(content);
};

export const buildAtUserMsg = (data: SentryAlertDto, userId: string) => {
  const AtUser = userId ? `<at user_id="${userId}"></at>` : '';
  console.log('[ buildFeishuTextMsg ] >', data);
  const content = {
    text: `${AtUser}`,
  };
  return JSON.stringify(content);
};
// <at user_id="ou_xxxxxxx">用户名（可不填）</at>
