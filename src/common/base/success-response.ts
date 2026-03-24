interface ISuccessResponsePayload<T> {
  data: T;
  message?: string;
}

export class SuccessResponse<T> {
  public data: T;

  public messages: string;

  constructor({ data, message = 'ok' }: ISuccessResponsePayload<T>) {
    this.data = data;
    this.messages = message;
  }
}
