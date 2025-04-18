import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween'; // nodejs
import { SentryAlertDto } from './dto/sentry-alert.dto';
import { buildFeishuTemplateCardMsg } from '@utils/feishu-message';

const { isWorkday } = require('chinese-workday');

const isHoliday = (day: number = dayjs().valueOf()) => {
  console.log(
    `[ dayTimeBetween('2025-01-22', '2025-02-05', day) ] >`,
    dayTimeBetween('2025-01-22', '2025-02-05', day),
  );
  return !isWorkday(day) || dayTimeBetween('2025-01-22', '2025-02-05', day);
};

dayjs.extend(isBetween);
export const hourTimeBetween = (
  startHour: number,
  endHour: number,
  time: number = dayjs().valueOf(),
) => {
  return dayjs(dayjs(time).tz('Asia/Shanghai').format('YYYY-MM-DD HH'))
    .tz('Asia/Shanghai')
    .isBetween(
      dayjs(time).tz('Asia/Shanghai').hour(startHour).format('YYYY-MM-DD HH'),
      dayjs(time).tz('Asia/Shanghai').hour(endHour).format('YYYY-MM-DD HH'),
      'hour',
    );
};

export const dayTimeBetween = (
  startDay: string,
  endDay: string,
  time: number = dayjs().valueOf(),
) => {
  return dayjs(dayjs(time).tz('Asia/Shanghai').format('YYYY-MM-DD'))
    .tz('Asia/Shanghai')
    .isBetween(startDay, endDay, 'day');
};

/**
 * 是否需要发送加急报警消息
 * @returns boolean
 */
export const isNeedSendAlertMsg = (time: number = dayjs().valueOf()) => {
  time = time * 1000;
  if (isHoliday(time) && hourTimeBetween(9, 24, time)) {
    return true;
  }
  if (hourTimeBetween(18, 24, time)) {
    return true;
  }
  return false;
};

export const buildAlertMsg = (alertInfo: SentryAlertDto, userId: string) => {
  // const AtUser = userId ? `<at user_id="${userId}"></at>` : '';

  const errorTime = dayjs(alertInfo.timeStamp * 1000).format(
    'YYYY-MM-DD HH:mm:ss',
  );
  const title = alertInfo.level == 'fatal' ? '高危报警' : '异常报警';
  const color = alertInfo.level == 'fatal' ? 'red' : 'orange';

  return buildFeishuTemplateCardMsg({
    ...alertInfo,
    errorTime,
    userId,
    title,
    color,
  });
};

// <at user_id="ou_xxxxxxx">用户名（可不填）</at>
