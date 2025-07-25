export class BaseException {
  code: number | string;
  message: string;
  constructor(message: string, code: number) {
    this.code = code;
    this.message = message;
  }
}
