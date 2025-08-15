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
        //5分钟后还没有读取消息，通知leader
        if (num >= time) {
          clearInterval(intervalHandler);
          resolve(false);
        }
      } catch (error) {
        clearInterval(intervalHandler);
        resolve(false);
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
