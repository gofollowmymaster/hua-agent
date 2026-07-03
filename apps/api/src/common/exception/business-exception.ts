import { BaseException } from './base-exception';

export class BusinessException extends BaseException {
  constructor(info = '', code = 500) {
    super('业务异常:' + info, code);
  }
}
