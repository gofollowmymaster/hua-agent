export class BaseException extends Error {
  code: number;
  message: string;
  constructor(message: string, code: number) {
    super();

    this.code = code;
    this.message = message;
  }
  // getCode() {
  //   return this.code;
  // }
}
