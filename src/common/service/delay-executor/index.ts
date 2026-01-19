import { Queue, Worker } from 'bullmq';

export class DelayedExecutor {
  private readonly queue: Queue;
  private readonly worker: Worker;
  private readonly callbacks: Map<string, (args: Record<string, any>) => void>;
  constructor() {
    this.queue = new Queue('delayedExecutor');
    this.callbacks = new Map();

    this.worker = new Worker('delayedExecutor', async (job) => {
      const { callbackId, args } = job.data;
      const callback = this.callbacks.get(callbackId);

      if (callback) {
        await callback(args);
        this.callbacks.delete(callbackId);
      }
    });
  }

  // 设置延迟执行
  async setDelayed(callbackId, delayMs, callback, ...args) {
    this.callbacks.set(callbackId, callback);

    return await this.queue.add(
      'execute',
      { callbackId, args },
      {
        delay: delayMs,
        jobId: `delay_${callbackId}`,
        removeOnComplete: true,
      },
    );
  }

  // 清除延迟
  async clearDelayed(callbackId) {
    this.callbacks.delete(callbackId);
    const job = await this.queue.getJob(`delay_${callbackId}`);
    if (job) {
      await job.remove();
    }
  }

  // 类似 setTimeout 的接口
  setTimeout(callback, delayMs, ...args) {
    const callbackId = `timeout_${Date.now()}_${Math.random()}`;
    this.setDelayed(callbackId, delayMs, callback, ...args);
    return callbackId;
  }

  clearTimeout(callbackId) {
    return this.clearDelayed(callbackId);
  }
}
