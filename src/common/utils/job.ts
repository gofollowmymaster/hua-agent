import { pick } from 'lodash';

/**
 * 添加执行任务可重试多次直到执行成功
 * @param handler
 * @param seconds
 * @param time
 * @returns
 */
export async function addRetryJob(
  handler: () => Promise<boolean>,
  seconds: number,
  time: number,
) {
  let num = 0;
  return new Promise((resolve, reject) => {
    const intervalHandler = setInterval(async () => {
      try {
        num++;
        const res = await handler();
        if (res) {
          clearInterval(intervalHandler);
          resolve(true);
        }
        //重试次数超过最大次数
        if (num >= time) {
          clearInterval(intervalHandler);
          reject(false);
        }
      } catch (error) {
        clearInterval(intervalHandler);
        reject(false);
      }
    }, seconds);
  });
}

export const wait = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

type HandleType = (
  handle: (...params) => any,
  wait: number,
  thisObj: any,
  throttleParamKeys?: string[],
) => any;
export const throttleByParams: HandleType = (
  handle,
  wait,
  thisObj,
  throttleParamKeys,
) => {
  handle = handle.bind(thisObj);
  const timerContainer = {};
  return (...params) => {
    const throttleParams = throttleParamKeys.length
      ? pick(params, throttleParamKeys)
      : params;

    const timerKey = JSON.stringify(throttleParams);
    const timer = timerContainer[timerKey];

    return new Promise((resolve, reject) => {
      if (timer) {
        clearTimeout(timer);
        timerContainer[timerKey] = setTimeout(async () => {
          try {
            const res = await handle(...params);
            resolve(res);
          } catch (error) {
            reject(error);
          }
        }, wait);
        return;
      }
      timerContainer[timerKey] = setTimeout(async () => {
        try {
          const res = await handle(...params);
          resolve(res);
        } catch (error) {
          reject(error);
        }
      }, wait);
    });
  };
};
