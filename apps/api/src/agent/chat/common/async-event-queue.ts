/** 合并多个异步投影，按到达顺序向上游交付事件。 */
export class AsyncEventQueue<T> implements AsyncIterable<T>, AsyncIterator<T> {
  private readonly values: T[] = [];
  private resolveNext?: (result: IteratorResult<T>) => void;
  private rejectNext?: (error: unknown) => void;
  private closed = false;

  push(value: T) {
    if (this.closed) return;
    if (this.resolveNext) {
      const resolve = this.resolveNext;
      this.clearWaiter();
      resolve({ value, done: false });
      return;
    }
    this.values.push(value);
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    if (this.resolveNext) {
      const resolve = this.resolveNext;
      this.clearWaiter();
      resolve({ value: undefined as never, done: true });
    }
  }

  fail(error: unknown) {
    if (this.closed) return;
    this.closed = true;
    if (this.rejectNext) {
      const reject = this.rejectNext;
      this.clearWaiter();
      reject(error);
    }
  }

  next(): Promise<IteratorResult<T>> {
    const value = this.values.shift();
    if (value !== undefined) {
      return Promise.resolve({ value, done: false });
    }
    if (this.closed) {
      return Promise.resolve({ value: undefined as never, done: true });
    }
    return new Promise<IteratorResult<T>>((resolve, reject) => {
      this.resolveNext = resolve;
      this.rejectNext = reject;
    });
  }

  [Symbol.asyncIterator]() {
    return this;
  }

  private clearWaiter() {
    this.resolveNext = undefined;
    this.rejectNext = undefined;
  }
}
