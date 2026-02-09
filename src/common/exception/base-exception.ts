export abstract class BaseException extends Error {
  code: number;
  message: string;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
    this.message = message;
  }
  // getCode() {
  //   return this.code;
  // }
}
