import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import FeishuAilyHelper from '@src/common/feishu/hepler/feishu-aily-helper';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { getGlobalAppInstance } from '@utils/app-config';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween'; // nodejs
const { isWorkday } = require('chinese-workday');

export function getModuleNameByUrl(url: string = '') {
  if (!url) return;
  url = url.replace('https://', '');
  url = url.replace('/api/', '/');
  const urlArr = url.split('/');
  return urlArr[1];
}

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

/**
 * 调用飞书报警助手辅助分析
 * @param message
 * @returns
 */
export const useAilyAlertSkill = async (message: string) => {
  const client = ClientFactory.create(FeishuApp.AiHeplerClient);
  const userContext = getGlobalAppInstance(TenantContext);

  const feishuAilyHelper = new FeishuAilyHelper(client, userContext);
  console.log('[ message ] >', message);
  const res = await feishuAilyHelper.useAilySkill(
    {
      app_id: 'spring_7886bc2b6f__c',
      skill_id: 'skill_553f9a1e04fc',
    },
    {
      global_variable: {
        query: message,
      },
    },
  );

  const output = JSON.parse(res.output);

  return output.data.answer;
};
