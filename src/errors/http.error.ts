export class HttpError extends Error {
  code: number;
  constructor(message: string, statusCode: number, stack: any = null) {
    super();
    this.code = statusCode;
    this.message = message;
    this.stack = stack;
  }
}
