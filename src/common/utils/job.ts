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
        console.log('[ 任务执行失败 ] >', error);
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
