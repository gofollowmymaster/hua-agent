import { BaseException } from './base-exception';

export class ActionLimitException extends BaseException {
  constructor(message: string = '', code: number = 200) {
    super('操作限流:' + message, code);
  }
}
