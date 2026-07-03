import { BaseException } from './base-exception';

export class NotReportException extends BaseException {
  constructor(message: string = '', code: number = 200) {
    super('忽略:' + message, code);
  }
}
