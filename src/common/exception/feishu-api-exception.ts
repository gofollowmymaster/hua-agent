import { BaseException } from './base-exception';

export class FeishuApiException extends BaseException {
  constructor(message: string = '', code: number = 1000) {
    super('飞书Api调用异常:' + message, code);
  }
}
