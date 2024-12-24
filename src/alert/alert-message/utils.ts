import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween'; // nodejs
const { isHoliday } = require('chinese-workday');

dayjs.extend(isBetween);
export const hourTimeBetween = (startHour: number, endHour: number) => {
  return dayjs().isBetween(
    dayjs().startOf('day').hour(startHour),
    dayjs().startOf('day').hour(endHour),
    'hour',
  );
};

/**
 * 是否需要发送加急报警消息
 * @returns boolean
 */
export const isNeedSendAlertMsg = () => {
  if (isHoliday(dayjs().format('YYYY-MM-DD')) && hourTimeBetween(19, 24)) {
    return true;
  }
  if (hourTimeBetween(19, 24)) {
    return true;
  }
  return false;
};
